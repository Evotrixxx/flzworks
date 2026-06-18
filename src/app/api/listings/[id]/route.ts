import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listingStatusOptions } from "@/lib/options";
import { removeUploadedPhoto, saveUploadedPhotos } from "@/lib/uploads";
import { normalizeLocale } from "@/lib/i18n";
import { validateListingPayload } from "@/lib/listing-validation";
import { resolvePhotoPlan } from "@/lib/photo-plan";
import { requireIntranetApiAccess } from "@/lib/intranet";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

async function findOwnedListing(id: string, userId: string) {
  return prisma.listing.findFirst({
    where: { id, sellerId: userId },
    include: { photos: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const intranetError = await requireIntranetApiAccess(request);
  if (intranetError) return intranetError;

  const [{ id }, user] = await Promise.all([context.params, getCurrentUser()]);

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const existing = await findOwnedListing(id, user.id);

  if (!existing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const formData = await request.formData();
  const raw = stringEntries(formData);
  const parsed = validateListingPayload(raw, normalizeLocale(raw.lang));

  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error, fieldErrors: parsed.fieldErrors }, { status: 400 });
  }

  const uploads = uploadEntries(formData);
  const savedPhotos = uploads.length ? await saveUploadedPhotos(uploads) : [];
  const photoPlan = resolvePhotoPlan({
    planJson: raw.photoPlan,
    existingPhotos: existing.photos,
    savedPhotoPaths: savedPhotos,
  });

  const listing = await prisma.$transaction(async (tx) => {
    const updated = await tx.listing.update({
      where: { id },
      data: parsed.data,
      select: { id: true },
    });

    if (photoPlan.removed.length) {
      await tx.listingPhoto.deleteMany({
        where: {
          id: {
            in: photoPlan.removed.map((photo) => photo.id),
          },
        },
      });
    }

    for (const photo of photoPlan.ordered) {
      if (photo.type === "existing") {
        await tx.listingPhoto.update({
          where: { id: photo.id },
          data: { sortOrder: photo.sortOrder },
        });
      } else {
        await tx.listingPhoto.create({
          data: {
            listingId: id,
            path: photo.path,
            sortOrder: photo.sortOrder,
          },
        });
      }
    }

    return updated;
  });

  await Promise.all(photoPlan.removed.map((photo) => removeUploadedPhoto(photo.path)));

  return NextResponse.json(listing);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const intranetError = await requireIntranetApiAccess(request);
  if (intranetError) return intranetError;

  const [{ id }, user] = await Promise.all([context.params, getCurrentUser()]);

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const parsed = z.object({ status: z.enum(listingStatusOptions) }).safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const existing = await findOwnedListing(id, user.id);

  if (!existing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  const listing = await prisma.listing.update({
    where: { id },
    data: { status: parsed.data.status },
    select: { id: true, status: true },
  });

  return NextResponse.json(listing);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const intranetError = await requireIntranetApiAccess(request);
  if (intranetError) return intranetError;

  const [{ id }, user] = await Promise.all([context.params, getCurrentUser()]);

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const existing = await findOwnedListing(id, user.id);

  if (!existing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  await prisma.listing.delete({ where: { id } });
  await Promise.all(existing.photos.map((photo) => removeUploadedPhoto(photo.path)));

  return NextResponse.json({ ok: true });
}
