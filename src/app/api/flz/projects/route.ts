import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminUser, flzProjectSchema } from "@/lib/flz-security";

export async function GET() {
  try {
    const auth = await verifyAdminUser();
    const isAdmin = auth.error === null;

    let projects: any[] = [];
    try {
      projects = await prisma.flzProject.findMany({
        where: isAdmin ? {} : { visible: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
    } catch (dbErr) {
      console.warn("flzProject DB query fallback:", dbErr);
    }

    return NextResponse.json({ projects, isAdmin });
  } catch (error) {
    console.error("Failed to fetch FLZ projects:", error);
    return NextResponse.json({ projects: [], isAdmin: false });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminUser();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = flzProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data provided", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const newProject = await prisma.flzProject.create({
      data: parsed.data,
    });

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (error) {
    console.error("Failed to create FLZ project:", error);
    return NextResponse.json({ error: "Failed to create project." }, { status: 500 });
  }
}
