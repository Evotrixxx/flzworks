import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { dictionaries } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import type { SearchParamsInput } from "@/lib/listings";
import { ListingForm } from "@/components/listing-form";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParamsInput>;
}) {
  const [{ id }, query, user] = await Promise.all([params, searchParams, getCurrentUser()]);
  const locale = await getLocale(query);

  if (!user) {
    redirect(`/login?redirect=/cars/${id}/edit&lang=${locale}`);
  }

  const listing = await prisma.listing.findFirst({
    where: { id, sellerId: user.id },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!listing) {
    redirect(`/dashboard?lang=${locale}`);
  }

  const t = dictionaries[locale];

  return (
    <>
      <Header locale={locale} />
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5">
          <h1 className="text-2xl font-black text-slate-950">{t.listing.edit}</h1>
        </div>
        <ListingForm mode="edit" locale={locale} t={t} initialListing={listing} />
      </div>
    </>
  );
}
