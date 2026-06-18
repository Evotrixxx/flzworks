import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { normalizeLocale } from "@/lib/i18n";
import { serializeListingToText } from "@/lib/listing-text-import";
import { prisma } from "@/lib/prisma";
import { requireIntranetApiAccess } from "@/lib/intranet";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function filenamePart(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

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

  const url = new URL(request.url);
  const locale = normalizeLocale(url.searchParams.get("lang"));
  const filename = `${filenamePart(`${listing.make}-${listing.model}-${listing.year}`) || "listing"}.txt`;

  return new Response(serializeListingToText(listing, locale), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
