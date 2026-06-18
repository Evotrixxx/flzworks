import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { normalizeLocale } from "@/lib/i18n";
import { parseListingText } from "@/lib/listing-text-import";
import { prisma } from "@/lib/prisma";
import { requireIntranetApiAccess } from "@/lib/intranet";

const importRequestSchema = z.object({
  action: z.enum(["preview", "create"]),
  text: z.string().max(200000),
  locale: z.enum(["hu", "en"]).optional(),
});

export async function POST(request: NextRequest) {
  const intranetError = await requireIntranetApiAccess(request);
  if (intranetError) return intranetError;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const parsedRequest = importRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsedRequest.success) {
    return NextResponse.json({ error: "Invalid import request." }, { status: 400 });
  }

  const locale = normalizeLocale(parsedRequest.data.locale);
  const preview = parseListingText(parsedRequest.data.text, locale);

  if (parsedRequest.data.action === "preview") {
    return NextResponse.json(preview);
  }

  const validItems = preview.items.filter((item) => item.ok);

  if (!validItems.length) {
    return NextResponse.json({ error: locale === "hu" ? "Nincs letrehozhato hirdetes." : "No valid listings to create.", preview }, { status: 400 });
  }

  const created = await prisma.$transaction(
    validItems.map((item) =>
      prisma.listing.create({
        data: {
          ...item.data,
          status: "DRAFT",
          sellerId: user.id,
        },
        select: { id: true },
      }),
    ),
  );

  return NextResponse.json({
    created,
    createdCount: created.length,
    skippedCount: preview.invalidCount,
    preview,
  });
}
