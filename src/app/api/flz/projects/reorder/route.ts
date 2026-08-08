import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { flzProjectOrderSchema, verifyAdminUser } from "@/lib/flz-security";

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminUser();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = flzProjectOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid project order", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const projects = await prisma.$transaction(
      parsed.data.projects.map(({ id, sortOrder }) =>
        prisma.flzProject.update({ where: { id }, data: { sortOrder } }),
      ),
    );

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("Failed to reorder FLZ projects:", error);
    return NextResponse.json({ error: "Failed to save project order." }, { status: 500 });
  }
}
