import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireIntranetApiAccess } from "@/lib/intranet";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const intranetError = await requireIntranetApiAccess(request);
  if (intranetError) return intranetError;

  const [{ id }, user] = await Promise.all([context.params, getCurrentUser()]);

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  await prisma.savedSearch.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  return NextResponse.json({ ok: true });
}
