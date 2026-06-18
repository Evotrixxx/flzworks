import Link from "next/link";
import Image from "next/image";
import { Calendar, Gauge, MapPin, ShieldCheck } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { ListingCardData } from "@/lib/listings";
import { formatHuf, formatKm, listingTitle, photoUrl } from "@/lib/format";
import { FavoriteButton } from "@/components/favorite-button";
import { autopiacPath } from "@/lib/routes";

function cleanCardDescription(description: string) {
  return description
    .replace(/Budapest,\s*__\.?\s*kerület\s*_{2,}\s*12/gi, "")
    .replace(/\+36\s*00\s*000\s*000/gi, "")
    .replace(/_{2,}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function ListingCard({
  listing,
  locale,
  t,
  isAuthenticated,
  variant = "list",
}: {
  listing: ListingCardData;
  locale: Locale;
  t: Dictionary;
  isAuthenticated: boolean;
  variant?: "tile" | "list";
}) {
  const title = listingTitle(listing);
  const href = `${autopiacPath(`/cars/${listing.id}`)}?lang=${locale}`;
  const badges = [
    listing.mileage === 0 ? "0 km" : null,
    listing.vatDeductible ? "ÁFA" : null,
    listing.availableImmediately ? (locale === "hu" ? "Azonnal elvihető" : "Available now") : null,
    listing.financingDetails ? (locale === "hu" ? "Finanszírozható" : "Financing") : null,
    t.enums.fuel[listing.fuel as keyof typeof t.enums.fuel],
    t.enums.condition[listing.condition as keyof typeof t.enums.condition],
  ].filter(Boolean);
  const description = cleanCardDescription(listing.description);

  if (variant === "tile") {
    return (
      <article className="glass-panel grid h-full overflow-hidden rounded-lg transition hover:-translate-y-0.5 hover:border-cyan-200/80">
        <Link href={href} className="relative block aspect-[16/10] bg-white/35">
          <Image
            src={photoUrl(listing.photos[0]?.path)}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
          {listing.status !== "PUBLISHED" && (
            <span className="absolute left-3 top-3 rounded-full bg-slate-950/85 px-2 py-1 text-xs font-black text-white shadow-sm backdrop-blur">
              {t.enums.status[listing.status as keyof typeof t.enums.status]}
            </span>
          )}
        </Link>

        <div className="grid content-between gap-4 p-4">
          <div className="grid gap-3">
            <div className="flex items-start justify-between gap-3">
              <Link href={href} className="min-w-0 text-lg font-black leading-tight text-slate-950 hover:text-cyan-800">
                {title}
              </Link>
              <FavoriteButton
                listingId={listing.id}
                initialFavorite={listing.favorites.length > 0}
                isAuthenticated={isAuthenticated}
                labels={{
                  favorite: t.listing.favorite,
                  favorited: t.listing.favorited,
                  needLogin: t.auth.needLogin,
                }}
                compact
              />
            </div>
            <p className="line-clamp-2 text-sm leading-6 text-slate-600">{description}</p>
            <SpecChips badges={badges} listing={listing} locale={locale} t={t} compact />
          </div>

          <div className="grid gap-3 border-t border-white/60 pt-4">
            <div>
              <p className="text-2xl font-black text-slate-950">{formatHuf(listing.price, locale)}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                {listing.seller.name}
              </p>
            </div>
            <Link
              href={href}
              className="liquid-button-primary inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-black text-white transition"
            >
              {t.listing.details}
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="glass-panel grid overflow-hidden rounded-lg transition hover:-translate-y-0.5 hover:border-cyan-200/80 md:grid-cols-[340px_1fr]">
      <Link href={href} className="relative block aspect-[16/10] bg-white/35 md:aspect-auto">
        <Image
          src={photoUrl(listing.photos[0]?.path)}
          alt={title}
          fill
          sizes="(min-width: 768px) 340px, 100vw"
          className="object-cover"
        />
        {listing.status !== "PUBLISHED" && (
          <span className="absolute left-3 top-3 rounded-full bg-slate-950/85 px-2 py-1 text-xs font-black text-white shadow-sm backdrop-blur">
            {t.enums.status[listing.status as keyof typeof t.enums.status]}
          </span>
        )}
      </Link>

      <div className="grid gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={href} className="text-lg font-black leading-tight text-slate-950 hover:text-cyan-800">
              {title}
            </Link>
            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <FavoriteButton
            listingId={listing.id}
            initialFavorite={listing.favorites.length > 0}
            isAuthenticated={isAuthenticated}
            labels={{
              favorite: t.listing.favorite,
              favorited: t.listing.favorited,
              needLogin: t.auth.needLogin,
            }}
            compact
          />
        </div>

        <SpecChips badges={badges} listing={listing} locale={locale} t={t} />

        <div className="flex flex-col gap-3 border-t border-white/60 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-2xl font-black text-slate-950">{formatHuf(listing.price, locale)}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              {listing.seller.name}
            </p>
          </div>
          <Link
            href={href}
            className="liquid-button-primary inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-black text-white transition"
          >
            {t.listing.details}
          </Link>
        </div>
      </div>
    </article>
  );
}

function SpecChips({
  badges,
  listing,
  locale,
  t,
  compact = false,
}: {
  badges: (string | null | undefined)[];
  listing: ListingCardData;
  locale: Locale;
  t: Dictionary;
  compact?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600">
      {badges.slice(0, compact ? 4 : 6).map((badge) => (
        <span key={badge} className="glass-chip rounded-full px-2 py-1 text-cyan-800">
          {badge}
        </span>
      ))}
      <span className="glass-chip inline-flex items-center gap-1 rounded-full px-2 py-1">
        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
        {listing.year}
      </span>
      <span className="glass-chip inline-flex items-center gap-1 rounded-full px-2 py-1">
        <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
        {formatKm(listing.mileage, locale)}
      </span>
      {!compact && (
        <span className="glass-chip rounded-full px-2 py-1">
          {t.enums.transmission[listing.transmission as keyof typeof t.enums.transmission]}
        </span>
      )}
      <span className="glass-chip inline-flex items-center gap-1 rounded-full px-2 py-1">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
        {listing.location}
      </span>
    </div>
  );
}
