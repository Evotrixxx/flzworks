import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminUser, flzProjectUpdateSchema } from "@/lib/flz-security";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await verifyAdminUser();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const body = await request.json().catch(() => null);
    const parsed = flzProjectUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid project update data", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.flzProject.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error(`Failed to update FLZ project ${id}:`, error);
    return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await verifyAdminUser();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const project = await prisma.flzProject.findUnique({
      where: { id },
      select: { socialPlatform: true, socialPostId: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      if (project.socialPlatform && project.socialPostId) {
        await tx.flzSocialProjectTombstone.upsert({
          where: {
            socialPlatform_socialPostId: {
              socialPlatform: project.socialPlatform,
              socialPostId: project.socialPostId,
            },
          },
          create: {
            socialPlatform: project.socialPlatform,
            socialPostId: project.socialPostId,
          },
          update: { deletedAt: new Date() },
        });
      }

      await tx.flzProject.delete({ where: { id } });
    });

    return NextResponse.json({ success: true, message: "Project deleted successfully." });
  } catch (error) {
    console.error(`Failed to delete FLZ project ${id}:`, error);
    return NextResponse.json({ error: "Failed to delete project." }, { status: 500 });
  }
}
