import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { dictionaries } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import type { ListingCardData, SearchParamsInput } from "@/lib/listings";
import { ListingCard } from "@/components/listing-card";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

export default async function FavoritesPage({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const params = await searchParams;
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale(params)]);

  if (!user) {
    redirect(`/login?redirect=/favorites&lang=${locale}`);
  }

  const t = dictionaries[locale];
  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: {
          seller: { select: { id: true, name: true, email: true } },
          photos: { orderBy: { sortOrder: "asc" } },
          favorites: { where: { userId: user.id }, select: { id: true } },
        },
      },
    },
  });
  const listings = favorites.map((favorite) => favorite.listing) as ListingCardData[];

  return (
    <>
      <Header locale={locale} />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="mb-5 text-2xl font-black text-slate-950">{t.favorites.title}</h1>
        {listings.length ? (
          <div className="grid gap-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} locale={locale} t={t} isAuthenticated />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-lg p-10 text-center font-black text-slate-950">
            {t.favorites.empty}
          </div>
        )}
      </main>
    </>
  );
}
