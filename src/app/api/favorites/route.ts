import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireIntranetApiAccess } from "@/lib/intranet";

const favoriteSchema = z.object({
  listingId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const intranetError = await requireIntranetApiAccess(request);
  if (intranetError) return intranetError;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const parsed = favoriteSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid favorite." }, { status: 400 });
  }

  await prisma.favorite.upsert({
    where: {
      userId_listingId: {
        userId: user.id,
        listingId: parsed.data.listingId,
      },
    },
    update: {},
    create: {
      userId: user.id,
      listingId: parsed.data.listingId,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const intranetError = await requireIntranetApiAccess(request);
  if (intranetError) return intranetError;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const parsed = favoriteSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid favorite." }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: {
      userId: user.id,
      listingId: parsed.data.listingId,
    },
  });

  return NextResponse.json({ ok: true });
}
