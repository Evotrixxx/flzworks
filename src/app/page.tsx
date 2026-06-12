import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { dictionaries } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getListings, type SearchParamsInput } from "@/lib/listings";
import { sortOptions } from "@/lib/options";
import { SearchPanel } from "@/components/search-panel";
import { MobileFilters } from "@/components/mobile-filters";
import { ListingCard } from "@/components/listing-card";
import { SaveSearchButton } from "@/components/save-search-button";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

function hiddenInputs(params: SearchParamsInput, exclude: string[]) {
  return Object.entries(params).flatMap(([key, raw]) => {
    if (exclude.includes(key)) {
      return [];
    }

    const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return values.map((value) => <input key={`${key}-${value}`} type="hidden" name={key} value={value} />);
  });
}

function hrefForPage(params: SearchParamsInput, page: number, locale: string) {
  const next = new URLSearchParams();

  for (const [key, raw] of Object.entries(params)) {
    if (key === "page") {
      continue;
    }

    const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const value of values) {
      next.append(key, value);
    }
  }

  next.set("lang", locale);
  next.set("page", String(page));
  return `/?${next.toString()}`;
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const params = await searchParams;
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale(params)]);
  const t = dictionaries[locale];
  const result = await getListings(params, user?.id);

  return (
    <>
      <Header locale={locale} />
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
      <aside className="hidden space-y-4 lg:block">
        <SearchPanel locale={locale} t={t} params={params} />
        <section className="glass-panel rounded-lg p-4">
          <p className="text-sm font-black text-slate-950">{t.home.promotionTitle}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t.home.promotionBody}</p>
        </section>
      </aside>

      <section className="min-w-0 space-y-5">
        <div className="glass-surface rounded-lg">
          <div className="grid md:grid-cols-[1fr_320px]">
            <div className="p-5 sm:p-6">
              <div className="glass-chip inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-black uppercase text-cyan-800">
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
                {t.brand}
              </div>
              <h1 className="mt-3 max-w-2xl text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {t.home.headline}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{t.home.subhead}</p>
            </div>
            <Image
              src="/seed/marketplace-cars.png"
              alt=""
              width={640}
              height={360}
              priority
              className="hidden h-full min-h-48 w-full object-cover md:block"
            />
          </div>
        </div>

        <div className="glass-panel flex flex-col gap-3 rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <MobileFilters label={t.home.mobileFilters}>
              <SearchPanel locale={locale} t={t} params={params} />
            </MobileFilters>
            <p className="text-sm font-black text-slate-950">
              {result.total} {t.home.resultCount}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SaveSearchButton isAuthenticated={Boolean(user)} label={t.home.saveSearch} />
            <form action="/" className="flex items-center gap-2">
              {hiddenInputs(params, ["sort", "page", "lang"])}
              <input type="hidden" name="lang" value={locale} />
              <select
                name="sort"
                defaultValue={result.filters.sort}
                className="h-10 px-3 text-sm font-semibold text-slate-700 outline-none transition"
              >
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {t.enums.sort[option]}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="liquid-button-primary inline-flex h-10 items-center rounded-full px-3 text-sm font-black text-white transition"
              >
                {t.filters.submit}
              </button>
            </form>
          </div>
        </div>

        {result.listings.length ? (
          <div className="grid gap-4">
            {result.listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                locale={locale}
                t={t}
                isAuthenticated={Boolean(user)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-lg p-10 text-center">
            <p className="font-black text-slate-950">{t.home.noResults}</p>
            <Link
              href={`/?lang=${locale}`}
              className="liquid-button-primary mt-4 inline-flex h-10 items-center rounded-full px-4 text-sm font-black text-white transition"
            >
              {t.home.resetFilters}
            </Link>
          </div>
        )}

        {result.pageCount > 1 && (
          <nav className="glass-panel flex items-center justify-between rounded-lg p-3">
            <Link
              href={hrefForPage(params, Math.max(1, result.page - 1), locale)}
              className="liquid-button-secondary inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-black text-slate-700 transition hover:text-cyan-800"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {Math.max(1, result.page - 1)}
            </Link>
            <span className="text-sm font-black text-slate-600">
              {result.page} / {result.pageCount}
            </span>
            <Link
              href={hrefForPage(params, Math.min(result.pageCount, result.page + 1), locale)}
              className="liquid-button-secondary inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-black text-slate-700 transition hover:text-cyan-800"
            >
              {Math.min(result.pageCount, result.page + 1)}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        )}
      </section>
      </main>
    </>
  );
}
