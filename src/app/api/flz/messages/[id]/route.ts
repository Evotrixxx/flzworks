import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminUser } from "@/lib/flz-security";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const MESSAGE_STATUSES = new Set(["NEW", "READ", "ARCHIVED"]);

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await verifyAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.status !== "string" || !MESSAGE_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "Invalid message status." }, { status: 400 });
  }

  try {
    const message = await prisma.flzContactMessage.update({
      where: { id },
      data: { status: body.status },
    });
    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error(`Failed to update FLZ message ${id}:`, error);
    return NextResponse.json({ error: "Failed to update message." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await verifyAdminUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  try {
    await prisma.flzContactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Failed to delete FLZ message ${id}:`, error);
    return NextResponse.json({ error: "Failed to delete message." }, { status: 500 });
  }
}
