import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireIntranetApiAccess } from "@/lib/intranet";

const savedSearchSchema = z.object({
  name: z.string().trim().min(1).max(120),
  query: z.string().max(2000).default(""),
});

export async function POST(request: NextRequest) {
  const intranetError = await requireIntranetApiAccess(request);
  if (intranetError) return intranetError;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const parsed = savedSearchSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid saved search." }, { status: 400 });
  }

  const savedSearch = await prisma.savedSearch.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      query: parsed.data.query,
    },
  });

  return NextResponse.json(savedSearch, { status: 201 });
}
