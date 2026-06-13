import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, ExternalLink, Fuel, Gauge, Mail, MapPin, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { dictionaries } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import type { SearchParamsInput } from "@/lib/listings";
import { formatEur, formatHuf, formatKm, listingTitle } from "@/lib/format";
import { FavoriteButton } from "@/components/favorite-button";
import { Header } from "@/components/header";
import { getListingDetailLabels } from "@/lib/listing-detail-labels";
import { isElectrifiedFuel } from "@/lib/listing-validation";
import { FeatureGroup } from "@/components/feature-group";
import { ListingPhotoGallery } from "@/components/listing-photo-gallery";

export const dynamic = "force-dynamic";

export default async function CarDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParamsInput>;
}) {
  const [{ id }, query, user] = await Promise.all([params, searchParams, getCurrentUser()]);
  const locale = await getLocale(query);
  const t = dictionaries[locale];
  const detailLabels = getListingDetailLabels(locale);
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: { select: { id: true, name: true, email: true } },
      photos: { orderBy: { sortOrder: "asc" } },
      favorites: { where: { userId: user?.id ?? "__anonymous__" }, select: { id: true } },
    },
  });

  if (!listing || (listing.status !== "PUBLISHED" && listing.sellerId !== user?.id)) {
    notFound();
  }

  const title = listingTitle(listing);
  const galleryLabels =
    locale === "hu"
      ? {
          open: "Kep nagyitasa",
          close: "Bezaras",
          previous: "Elozo kep",
          next: "Kovetkezo kep",
          image: "Kep",
        }
      : {
          open: "Open image",
          close: "Close",
          previous: "Previous image",
          next: "Next image",
          image: "Image",
        };
  const fuelLabel = t.enums.fuel[listing.fuel as keyof typeof t.enums.fuel] ?? listing.fuel;
  const transmissionLabel =
    t.enums.transmission[listing.transmission as keyof typeof t.enums.transmission] ?? listing.transmission;
  const bodyTypeLabel = t.enums.bodyType[listing.bodyType as keyof typeof t.enums.bodyType] ?? listing.bodyType;
  const conditionLabel = t.enums.condition[listing.condition as keyof typeof t.enums.condition] ?? listing.condition;
  const statusLabel = t.enums.status[listing.status as keyof typeof t.enums.status] ?? listing.status;
  const isElectrified = isElectrifiedFuel(listing.fuel);
  const costRows = compactRows([
    [detailLabels.fields.purchasePrice, formatHuf(listing.price, locale)],
    [detailLabels.fields.purchasePriceEur, listing.priceEur ? formatEur(listing.priceEur, locale) : null],
  ]);
  const generalRows = compactRows([
    [detailLabels.fields.yearMonth, listing.yearMonth ?? listing.year],
    [t.listing.condition, conditionLabel],
    [t.listing.bodyType, bodyTypeLabel],
    [t.listing.status, statusLabel],
  ]);
  const financeRows = compactRows([
    [detailLabels.fields.financingDetails, listing.financingDetails],
    [
      detailLabels.fields.financeTermMonths,
      listing.financeTermMonths ? `${listing.financeTermMonths} ${detailLabels.values.months}` : null,
    ],
  ]);
  const vehicleRows = compactRows([
    [t.listing.year, listing.year],
    [t.listing.mileage, formatKm(listing.mileage, locale)],
    [detailLabels.fields.seats, listing.seats ? `${listing.seats} ${detailLabels.values.people}` : null],
    [detailLabels.fields.doors, listing.doors ? `${listing.doors} ${detailLabels.values.doors}` : null],
    [detailLabels.fields.color, listing.color],
    [detailLabels.fields.upholsteryPrimary, listing.upholsteryPrimary],
    [detailLabels.fields.upholsterySecondary, listing.upholsterySecondary],
    [detailLabels.fields.curbWeightKg, withUnit(listing.curbWeightKg, detailLabels.values.kg)],
    [detailLabels.fields.grossWeightKg, withUnit(listing.grossWeightKg, detailLabels.values.kg)],
    [detailLabels.fields.trunkVolumeLiters, withUnit(listing.trunkVolumeLiters, detailLabels.values.liter)],
    [detailLabels.fields.climate, listing.climate],
    [detailLabels.fields.roof, listing.roof],
  ]);
  const motorRows = compactRows([
    [t.listing.fuel, fuelLabel],
    [t.listing.transmission, transmissionLabel],
    [detailLabels.fields.engineDisplacementCcm, withUnit(listing.engineDisplacementCcm, detailLabels.values.ccm)],
    [detailLabels.fields.powerKw, joinPower(listing.powerKw, listing.powerHp, detailLabels.values.kw, detailLabels.values.hp)],
    [detailLabels.fields.cylinderLayout, listing.cylinderLayout],
    [detailLabels.fields.driveType, listing.driveType],
    [detailLabels.fields.gearboxDetail, listing.gearboxDetail],
  ]);
  const batteryRows = isElectrified
    ? compactRows([
        [detailLabels.fields.batteryCapacityPercent, withUnit(listing.batteryCapacityPercent, detailLabels.values.percent)],
        [detailLabels.fields.acChargerType, listing.acChargerType],
        [detailLabels.fields.fastCharging, listing.fastCharging ? detailLabels.values.yes : detailLabels.values.no],
        [detailLabels.fields.wltpRangeKm, withUnit(listing.wltpRangeKm, detailLabels.values.km)],
        [
          detailLabels.fields.systemPowerKw,
          joinPower(listing.systemPowerKw, listing.systemPowerHp, detailLabels.values.kw, detailLabels.values.hp),
        ],
      ])
    : [];
  const documentRows = compactRows([
    [detailLabels.fields.documentsType, listing.documentsType],
    [detailLabels.fields.inspectionValidUntil, listing.inspectionValidUntil],
  ]);
  const tireRows = compactRows([
    [detailLabels.fields.frontTireSize, listing.frontTireSize],
    [detailLabels.fields.rearTireSize, listing.rearTireSize],
  ]);
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`;
  const sidebarLabels =
    locale === "hu"
      ? {
          overview: "Gyors attekintes",
          map: "Megnyitas Google Maps-ben",
          mapHint: "A terkep a hirdetes helysegere keres ra.",
        }
      : {
          overview: "Quick overview",
          map: "Open in Google Maps",
          mapHint: "The map opens a search for the listing location.",
        };

  return (
    <>
      <Header locale={locale} />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href={`/?lang=${locale}`}
        className="mb-4 inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm font-black text-slate-600 hover:bg-white/60 hover:text-cyan-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {t.listing.back}
      </Link>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-5">
          <ListingPhotoGallery photos={listing.photos} title={title} labels={galleryLabels} />

          <section className="glass-panel rounded-lg p-5">
            <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">{title}</h1>
            <p className="mt-2 text-3xl font-black text-cyan-800">{formatHuf(listing.price, locale)}</p>
            <p className="mt-4 leading-7 text-slate-700">{listing.description}</p>
          </section>

          <SpecSection title={detailLabels.sections.priceCosts} rows={costRows} />
          <SpecSection title={detailLabels.sections.general} rows={generalRows} />
          {financeRows.length > 0 && <SpecSection title={detailLabels.sections.financing} rows={financeRows} />}
          <SpecSection title={detailLabels.sections.vehicle} rows={vehicleRows} />
          <SpecSection title={detailLabels.sections.motor} rows={motorRows} />
          {batteryRows.length > 0 && <SpecSection title={detailLabels.sections.battery} rows={batteryRows} />}
          {documentRows.length > 0 && <SpecSection title={detailLabels.sections.documents} rows={documentRows} />}
          {tireRows.length > 0 && <SpecSection title={detailLabels.sections.tires} rows={tireRows} />}
          <EquipmentSection
            title={detailLabels.sections.equipment}
            showMoreLabel={locale === "hu" ? "Több mutatása" : "Show more"}
            showLessLabel={locale === "hu" ? "Kevesebb mutatása" : "Show less"}
            groups={[
              [detailLabels.sections.interior, listing.interiorFeatures],
              [detailLabels.sections.technical, listing.technicalFeatures],
              [detailLabels.sections.exterior, listing.exteriorFeatures],
              [detailLabels.sections.multimedia, listing.multimediaFeatures],
              [detailLabels.sections.extra, listing.extraInfo],
            ]}
          />
        </section>

        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <section className="glass-panel rounded-lg p-5">
            <h2 className="text-lg font-black text-slate-950">{sidebarLabels.overview}</h2>
            <p className="mt-3 text-3xl font-black text-cyan-800">{formatHuf(listing.price, locale)}</p>
            {listing.priceEur && <p className="mt-1 text-sm font-semibold text-slate-500">{formatEur(listing.priceEur, locale)}</p>}
            <dl className="mt-4 grid gap-2">
              <SidebarFact icon={<Calendar className="h-4 w-4" aria-hidden="true" />} label={t.listing.year} value={listing.year} />
              <SidebarFact icon={<Gauge className="h-4 w-4" aria-hidden="true" />} label={t.listing.mileage} value={formatKm(listing.mileage, locale)} />
              <SidebarFact icon={<Fuel className="h-4 w-4" aria-hidden="true" />} label={t.listing.fuel} value={fuelLabel} />
              <SidebarFact label={t.listing.transmission} value={transmissionLabel} />
              <SidebarFact label={t.listing.condition} value={conditionLabel} />
            </dl>
          </section>

          <section className="glass-panel rounded-lg p-5">
            <h2 className="text-lg font-black text-slate-950">{t.listing.seller}</h2>
            <p className="mt-3 inline-flex items-center gap-2 font-black text-slate-900">
              <ShieldCheck className="h-5 w-5 text-emerald-700" aria-hidden="true" />
              {listing.seller.name}
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {listing.location}
            </p>
            <a
              href={`mailto:${listing.seller.email}`}
              className="liquid-button-primary mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-black text-white transition"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {t.listing.contact}
            </a>
          </section>

          <section className="glass-panel rounded-lg p-5">
            <div className="glass-chip grid min-h-32 place-items-center rounded-lg p-4 text-center">
              <MapPin className="h-8 w-8 text-cyan-700" aria-hidden="true" />
              <div>
                <p className="font-black text-slate-950">{listing.location}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{sidebarLabels.mapHint}</p>
              </div>
            </div>
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="liquid-button-secondary mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-black text-slate-700 transition hover:text-cyan-800"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              {sidebarLabels.map}
            </a>
          </section>

          {(listing.historyInternationalEnabled || listing.historyDomesticEnabled) && (
            <section className="glass-panel rounded-lg p-5">
              <h2 className="text-lg font-black text-slate-950">{detailLabels.sections.history}</h2>
              <div className="mt-4 grid gap-3">
                {listing.historyInternationalEnabled && (
                  <HistoryCallout title="carVertical" body={detailLabels.values.carvertical} />
                )}
                {listing.historyDomesticEnabled && (
                  <HistoryCallout
                    title="totalcar"
                    body={detailLabels.values.totalcar}
                    badge={detailLabels.values.discount}
                  />
                )}
              </div>
            </section>
          )}

          <FavoriteButton
            listingId={listing.id}
            initialFavorite={listing.favorites.length > 0}
            isAuthenticated={Boolean(user)}
            labels={{
              favorite: t.listing.favorite,
              favorited: t.listing.favorited,
              needLogin: t.auth.needLogin,
            }}
          />

          {listing.sellerId === user?.id && (
            <Link
              href={`/cars/${listing.id}/edit?lang=${locale}`}
              className="liquid-button-secondary inline-flex h-11 w-full items-center justify-center rounded-full px-4 text-sm font-black text-slate-700 transition hover:text-cyan-800"
            >
              {t.listing.edit}
            </Link>
          )}
        </aside>
      </div>
      </main>
    </>
  );
}

function SidebarFact({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="glass-chip flex items-center justify-between gap-3 rounded-lg px-3 py-2">
      <dt className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
        {icon}
        {label}
      </dt>
      <dd className="text-right text-sm font-black text-slate-950">{value}</dd>
    </div>
  );
}

type DetailRow = [string, ReactNode];

function compactRows(rows: Array<[string, ReactNode | null | undefined | ""]>): DetailRow[] {
  return rows.filter((row): row is DetailRow => row[1] !== null && row[1] !== undefined && row[1] !== "");
}

function withUnit(value: number | null, unit: string) {
  return value !== null ? `${value} ${unit}` : null;
}

function joinPower(kw: number | null, hp: number | null, kwUnit: string, hpUnit: string) {
  return [
    kw ? `${kw} ${kwUnit}` : null,
    hp ? `${hp} ${hpUnit}` : null,
  ]
    .filter(Boolean)
    .join(", ");
}

function SpecSection({ title, rows }: { title: string; rows: DetailRow[] }) {
  if (!rows.length) {
    return null;
  }

  return (
    <section className="glass-panel rounded-lg p-5">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="glass-chip flex items-center justify-between gap-4 rounded-lg px-3 py-2">
            <dt className="text-sm font-semibold text-slate-500">{label}</dt>
            <dd className="text-right text-sm font-black text-slate-950">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function EquipmentSection({
  title,
  groups,
  showMoreLabel,
  showLessLabel,
}: {
  title: string;
  groups: Array<[string, string | null]>;
  showMoreLabel: string;
  showLessLabel: string;
}) {
  const parsedGroups = groups
    .map(([groupTitle, value]) => [
      groupTitle,
      (value ?? "")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
    ] as const)
    .filter(([, items]) => items.length > 0);

  if (!parsedGroups.length) {
    return null;
  }

  return (
    <section className="glass-panel rounded-lg p-5">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-5">
        {parsedGroups.map(([groupTitle, items]) => (
          <FeatureGroup
            key={groupTitle}
            title={groupTitle}
            items={items}
            showMoreLabel={showMoreLabel}
            showLessLabel={showLessLabel}
          />
        ))}
      </div>
    </section>
  );
}

function HistoryCallout({ title, body, badge }: { title: string; body: string; badge?: string }) {
  return (
    <div className="glass-chip rounded-lg p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-black text-slate-950">{title}</p>
        {badge && <span className="rounded-full bg-rose-100/80 px-2 py-1 text-xs font-black text-rose-700">{badge}</span>}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </div>
  );
}
