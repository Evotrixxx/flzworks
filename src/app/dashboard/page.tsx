import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { dictionaries } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import type { ListingCardData, SearchParamsInput } from "@/lib/listings";
import { ListingCard } from "@/components/listing-card";
import { DashboardActions } from "@/components/dashboard-actions";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const params = await searchParams;
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale(params)]);

  if (!user) {
    redirect(`/login?redirect=/dashboard&lang=${locale}`);
  }

  const t = dictionaries[locale];
  const listings = (await prisma.listing.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      seller: {
        select: { id: true, name: true, email: true },
      },
      photos: {
        orderBy: { sortOrder: "asc" },
      },
      favorites: {
        where: { userId: user.id },
        select: { id: true },
      },
    },
  })) as ListingCardData[];

  return (
    <>
      <Header locale={locale} />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-950">{t.dashboard.title}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">{t.dashboard.subtitle}</p>
          </div>
          <Link
            href={`/sell?lang=${locale}`}
            className="liquid-button-primary inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-black text-white transition"
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            {t.dashboard.newListing}
          </Link>
        </div>

        {listings.length ? (
          <div className="grid gap-4">
            {listings.map((listing) => (
              <div key={listing.id} className="grid gap-2">
                <ListingCard listing={listing} locale={locale} t={t} isAuthenticated />
                <div className="glass-panel flex flex-wrap items-center justify-between gap-2 rounded-lg p-3">
                  <Link
                    href={`/cars/${listing.id}/edit?lang=${locale}`}
                    className="liquid-button-secondary inline-flex h-9 items-center rounded-full px-3 text-xs font-black text-slate-700 transition hover:text-cyan-800"
                  >
                    {t.listing.edit}
                  </Link>
                  <DashboardActions
                    id={listing.id}
                    status={listing.status}
                    labels={{ publish: t.forms.publish, save: t.forms.save, delete: t.forms.delete }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-lg p-10 text-center">
            <p className="font-black text-slate-950">{t.dashboard.empty}</p>
            <Link
              href={`/sell?lang=${locale}`}
              className="liquid-button-primary mt-4 inline-flex h-10 items-center rounded-full px-4 text-sm font-black text-white transition"
            >
              {t.dashboard.newListing}
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
