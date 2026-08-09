import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminUser } from "@/lib/flz-security";
import { syncSocialProjects } from "@/lib/social-project-sync";

function hasSyncSecret(request: NextRequest): boolean {
  const configured = process.env.SOCIAL_SYNC_SECRET?.trim();
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!configured || !supplied) return false;

  const expected = Buffer.from(configured);
  const actual = Buffer.from(supplied);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function POST(request: NextRequest) {
  if (!hasSyncSecret(request)) {
    const auth = await verifyAdminUser();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
  }

  const result = await syncSocialProjects();
  const failed = result.providers.filter((provider) => provider.error);
  const configured = result.providers.filter((provider) => provider.configured);
  return NextResponse.json({
    success: configured.length > 0 && failed.length === 0,
    partial: failed.length > 0 && failed.length < configured.length,
    ...result,
  });
}
