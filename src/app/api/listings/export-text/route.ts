import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { normalizeLocale } from "@/lib/i18n";
import { serializeListingsToText } from "@/lib/listing-text-import";
import { prisma } from "@/lib/prisma";
import { requireIntranetApiAccess } from "@/lib/intranet";

function downloadResponse(text: string, filename: string) {
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(request: NextRequest) {
  const intranetError = await requireIntranetApiAccess(request);
  if (intranetError) return intranetError;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const url = new URL(request.url);
  const locale = normalizeLocale(url.searchParams.get("lang"));
  const listings = await prisma.listing.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return downloadResponse(serializeListingsToText(listings, locale), "autopiac-listings.txt");
}
