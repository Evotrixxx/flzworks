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

    const updatedSettings: Record<string, string> = {};

    for (const [key, value] of Object.entries(body)) {
      const parsed = flzSettingSchema.safeParse({ key, value: String(value) });
      if (parsed.success) {
        const saved = await prisma.flzSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
        updatedSettings[saved.key] = saved.value;
      }
    }

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    console.error("Failed to update FLZ settings:", error);
    return NextResponse.json({ error: "Failed to update settings." }, { status: 500 });
  }
}
