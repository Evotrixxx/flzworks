import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
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
  const user = await getCurrentUser();
  const isAdmin = user && (user.role === "ADMIN" || user.email === "seller@autopiac.test");

  if (!user || !isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  try {
    const parsed = BodySchema.parse(await request.json());
    await writeSocialConfig(parsed.entries);
    return NextResponse.json({ success: true, entries: parsed.entries });
  } catch (error) {
    console.error("Failed to save social config:", error);
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
}
