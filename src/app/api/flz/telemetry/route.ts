import { NextResponse } from "next/server";
import { verifyAdminUser } from "@/lib/flz-security";
import { deleteExpiredTelemetry, getTelemetrySnapshot } from "@/lib/telemetry";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await verifyAdminUser();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await deleteExpiredTelemetry();
    const telemetry = await getTelemetrySnapshot();
    return NextResponse.json(
      { telemetry },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    console.error("Failed to read telemetry:", error);
    return NextResponse.json({ error: "Failed to read telemetry" }, { status: 500 });
  }
}
