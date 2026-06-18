import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listingToTemplateValues } from "@/lib/listing-template";
import { prisma } from "@/lib/prisma";
import { requireIntranetApiAccess } from "@/lib/intranet";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const intranetError = await requireIntranetApiAccess(request);
  if (intranetError) return intranetError;

  const [{ id }, user] = await Promise.all([context.params, getCurrentUser()]);

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const listing = await prisma.listing.findFirst({
    where: { id, sellerId: user.id },
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  return NextResponse.json(listingToTemplateValues(listing));
}
