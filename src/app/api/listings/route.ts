import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedPhotos } from "@/lib/uploads";
import { normalizeLocale } from "@/lib/i18n";
import { validateListingPayload } from "@/lib/listing-validation";
import { resolvePhotoPlan } from "@/lib/photo-plan";
import { requireIntranetApiAccess } from "@/lib/intranet";

function stringEntries(formData: FormData) {
  return Object.fromEntries(
    Array.from(formData.entries()).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

function uploadEntries(formData: FormData) {
  return formData
    .getAll("photos")
    .filter((entry): entry is File => typeof entry === "object" && "arrayBuffer" in entry && entry.size > 0);
}

export async function POST(request: NextRequest) {
  const intranetError = await requireIntranetApiAccess(request);
  if (intranetError) return intranetError;

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const formData = await request.formData();
  const raw = stringEntries(formData);
  const parsed = validateListingPayload(raw, normalizeLocale(raw.lang));

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error, fieldErrors: parsed.fieldErrors }, { status: 400 });
  }

  const savedPhotos = await saveUploadedPhotos(uploadEntries(formData));
  const photoPlan = resolvePhotoPlan({
    planJson: raw.photoPlan,
    existingPhotos: [],
    savedPhotoPaths: savedPhotos,
  });

  const listing = await prisma.listing.create({
    data: {
      ...parsed.data,
      sellerId: user.id,
      photos: photoPlan.ordered.length
        ? {
            create: photoPlan.ordered.map((photo) => ({
              path: photo.path,
              sortOrder: photo.sortOrder,
            })),
          }
        : undefined,
    },
    select: { id: true },
  });

  return NextResponse.json(listing, { status: 201 });
}
