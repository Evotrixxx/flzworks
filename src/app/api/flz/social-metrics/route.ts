import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminUser } from "@/lib/flz-security";
import { getSocialMetricsSnapshot, writeStoredSocialMetrics } from "@/lib/social-metrics";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await verifyAdminUser();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const metrics = await getSocialMetricsSnapshot();
    return NextResponse.json(
      { metrics },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Failed to read social metrics:", error);
    return NextResponse.json({ error: "Failed to read social metrics" }, { status: 500 });
  }
}

const MetricSchema = z.object({
  platform: z.enum(["instagram", "tiktok", "linkedin"]),
  followers: z.number().int().nonnegative().max(1_000_000_000).nullable(),
  likes: z.number().int().nonnegative().max(1_000_000_000).nullable(),
});

export async function POST(request: Request) {
  const auth = await verifyAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = z.object({ accounts: z.array(MetricSchema).length(3) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success || new Set(parsed.data?.accounts.map((item) => item.platform)).size !== 3) {
    return NextResponse.json({ error: "Invalid social metrics." }, { status: 400 });
  }
  try {
    await writeStoredSocialMetrics(parsed.data.accounts.map((account) => ({
      ...account,
      available: account.followers !== null || account.likes !== null,
    })));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save social metrics:", error);
    return NextResponse.json({ error: "Could not persist social metrics." }, { status: 500 });
  }
}
