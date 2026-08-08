import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminUser } from "@/lib/flz-security";
import { readSocialConfig, writeSocialConfig } from "@/lib/social-config";

const EntrySchema = z.object({
  platform: z.enum(["x", "instagram", "tiktok", "linkedin"]),
  label: z.string().max(80),
  postUrl: z.string().max(1000),
  imageUrl: z.string().max(2000),
});

const BodySchema = z.object({
  entries: z.array(EntrySchema).max(8),
});

export async function GET() {
  return NextResponse.json({ entries: await readSocialConfig() });
}

export async function POST(request: Request) {
  const auth = await verifyAdminUser();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  try {
    await writeSocialConfig(parsed.data.entries);
    return NextResponse.json({ success: true, entries: parsed.data.entries });
  } catch (error) {
    console.error("Failed to write social config:", error);
    return NextResponse.json({ error: "Could not persist social configuration." }, { status: 500 });
  }
}
