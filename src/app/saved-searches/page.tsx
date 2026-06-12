import Link from "next/link";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { dictionaries } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import type { SearchParamsInput } from "@/lib/listings";
import { SavedSearchActions } from "@/components/saved-search-actions";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

function savedSearchHref(query: string, locale: string) {
  const params = new URLSearchParams(query);
  params.set("lang", locale);
  return `/?${params.toString()}`;
}

export default async function SavedSearchesPage({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const params = await searchParams;
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale(params)]);

  if (!user) {
    redirect(`/login?redirect=/saved-searches&lang=${locale}`);
  }

  const t = dictionaries[locale];
  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header locale={locale} />
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="mb-5 text-2xl font-black text-slate-950">{t.saved.title}</h1>
        {savedSearches.length ? (
          <div className="grid gap-3">
            {savedSearches.map((savedSearch) => (
              <article
                key={savedSearch.id}
                className="glass-panel flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="font-black text-slate-950">{savedSearch.name}</h2>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-500">{savedSearch.query || "all"}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={savedSearchHref(savedSearch.query, locale)}
                    className="liquid-button-primary inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-black text-white transition"
                  >
                    <Search className="h-4 w-4" aria-hidden="true" />
                    {t.saved.open}
                  </Link>
                  <SavedSearchActions id={savedSearch.id} label={t.saved.remove} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-lg p-10 text-center font-black text-slate-950">
            {t.saved.empty}
          </div>
        )}
      </main>
    </>
  );
}
