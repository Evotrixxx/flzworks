import Link from "next/link";
import { ArrowLeft, ArrowRight, LayoutGrid, List } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { dictionaries } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getListings, type SearchParamsInput } from "@/lib/listings";
import { sortOptions } from "@/lib/options";
import { CarModelScene } from "@/components/car-model-scene";
import { ListingCard } from "@/components/listing-card";
import { SaveSearchButton } from "@/components/save-search-button";
import { ShowroomSearchPanel } from "@/components/showroom-search-panel";
import { Header } from "@/components/header";
import { AUTOPIAC_BASE_PATH } from "@/lib/routes";

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
  return `${AUTOPIAC_BASE_PATH}?${next.toString()}`;
}

function hrefForView(params: SearchParamsInput, view: "tile" | "list", locale: string) {
  const next = new URLSearchParams();

  for (const [key, raw] of Object.entries(params)) {
    if (key === "view" || key === "page") {
      continue;
    }

    const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const value of values) {
      next.append(key, value);
    }
  }

  next.set("lang", locale);
  if (view !== "tile") {
    next.set("view", view);
  }

  return `${AUTOPIAC_BASE_PATH}?${next.toString()}`;
}

function selectedView(params: SearchParamsInput): "tile" | "list" {
  const raw = Array.isArray(params.view) ? params.view[0] : params.view;
  return raw === "list" ? "list" : "tile";
}

function hasSearchIntent(params: SearchParamsInput) {
  const passive = new Set(["lang", "view", "sort", "page"]);
  return Object.entries(params).some(([key, raw]) => {
    if (passive.has(key)) {
      return false;
    }

    const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return values.some((item) => item.trim() !== "");
  });
}

export default async function Home({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const params = await searchParams;
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale(params)]);
  const t = dictionaries[locale];
  const result = await getListings(params, user?.id);
  const view = selectedView(params);
  const searched = hasSearchIntent(params);
  const viewLabels =
    locale === "hu"
      ? { tile: "Csempék", list: "Lista" }
      : { tile: "Tiles", list: "List" };

  return (
    <>
      <Header locale={locale} />
      <main className={`showroom-page ${searched ? "showroom-page--results" : "showroom-page--landing"}`}>
        <div className="showroom-shapes" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        {!searched ? (
          <section className="showroom-landing" aria-label={t.home.headline}>
            <div className="showroom-landing__stage">
              <div className="showroom-landing__search">
                <ShowroomSearchPanel locale={locale} t={t} params={params} />
              </div>
              <div className="showroom-landing__model" aria-hidden="true">
                <CarModelScene />
              </div>
            </div>
          </section>
        ) : (
          <section className="showroom-results">
            <aside className="showroom-model-rail">
              <div className="showroom-floating-filters">
                <ShowroomSearchPanel locale={locale} t={t} params={params} mode="compact" />
              </div>
              <div className="showroom-rail-model" aria-hidden="true">
                <CarModelScene compact />
              </div>
            </aside>

            <section className="showroom-listings min-w-0 space-y-5">
              <div className="glass-panel flex flex-col gap-3 rounded-lg p-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-black text-slate-950">
                    {result.total} {t.home.resultCount}
                  </p>
                  <div className="glass-chip inline-flex rounded-full p-1 text-sm font-black text-slate-600">
                    <Link
                      href={hrefForView(params, "tile", locale)}
                      className={`inline-flex h-9 items-center gap-2 rounded-full px-3 transition ${
                        view === "tile" ? "bg-white text-black shadow-sm" : "hover:bg-white/70 hover:text-slate-950"
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                      {viewLabels.tile}
                    </Link>
                    <Link
                      href={hrefForView(params, "list", locale)}
                      className={`inline-flex h-9 items-center gap-2 rounded-full px-3 transition ${
                        view === "list" ? "bg-white text-black shadow-sm" : "hover:bg-white/70 hover:text-slate-950"
                      }`}
                    >
                      <List className="h-4 w-4" aria-hidden="true" />
                      {viewLabels.list}
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <SaveSearchButton isAuthenticated={Boolean(user)} label={t.home.saveSearch} />
                  <form action={AUTOPIAC_BASE_PATH} className="flex items-center gap-2">
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
                <div className={view === "tile" ? "grid gap-4 md:grid-cols-2" : "grid gap-4"}>
                  {result.listings.map((listing) => (
                    <div key={listing.id} className="ap3d-card-3d">
                      <ListingCard
                        listing={listing}
                        locale={locale}
                        t={t}
                        isAuthenticated={Boolean(user)}
                        variant={view}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-panel rounded-lg p-10 text-center">
                  <p className="font-black text-slate-950">{t.home.noResults}</p>
                  <Link
                    href={`${AUTOPIAC_BASE_PATH}?lang=${locale}`}
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
          </section>
        )}
      </main>
    </>
  );
}
