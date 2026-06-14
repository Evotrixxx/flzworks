import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { listingToTemplateValues } from "@/lib/listing-template";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
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
