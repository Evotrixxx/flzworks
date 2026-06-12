import type { Locale } from "@/lib/i18n";

export function formatHuf(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "hu" ? "hu-HU" : "en-US", {
    style: "currency",
    currency: "HUF",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatEur(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "hu" ? "hu-HU" : "en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKm(value: number, locale: Locale) {
  return `${new Intl.NumberFormat(locale === "hu" ? "hu-HU" : "en-US").format(value)} km`;
}

export function listingTitle(listing: { make: string; model: string; trim?: string | null; year: number }) {
  return [listing.make, listing.model, listing.trim].filter(Boolean).join(" ") + ` (${listing.year})`;
}

export function photoUrl(path: string | undefined) {
  if (!path) {
    return "/seed/marketplace-cars.png";
  }

  if (path.startsWith("/")) {
    return path;
  }

  return `/media/${encodeURIComponent(path)}`;
}
