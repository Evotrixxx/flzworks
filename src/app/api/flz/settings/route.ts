import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminUser, flzSettingSchema } from "@/lib/flz-security";

export async function GET() {
  try {
    const settingsList = await prisma.flzSetting.findMany();
    const settings: Record<string, string> = {};
    for (const item of settingsList) {
      settings[item.key] = item.value;
    }
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to fetch FLZ settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminUser();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const parsedEntries = Object.entries(body).map(([key, value]) =>
      flzSettingSchema.safeParse({ key, value: String(value) }),
    );
    const invalidKeys = parsedEntries
      .map((result, index) => (result.success ? null : Object.keys(body)[index]))
      .filter((key): key is string => key !== null);

    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { error: `Invalid settings: ${invalidKeys.join(", ")}`, invalidKeys },
        { status: 400 },
      );
    }

    const validEntries = parsedEntries.map((result) => {
      if (!result.success) throw new Error("Settings validation invariant failed");
      return result.data;
    });
    const savedSettings = await prisma.$transaction(
      validEntries.map((entry) =>
        prisma.flzSetting.upsert({
          where: { key: entry.key },
          update: { value: entry.value },
          create: entry,
        }),
      ),
    );
    const updatedSettings: Record<string, string> = Object.fromEntries(
      savedSettings.map((saved) => [saved.key, saved.value]),
    );

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error("Failed to update FLZ settings:", error);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
