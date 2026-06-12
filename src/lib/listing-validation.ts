import { z } from "zod";
import type { Locale } from "@/lib/i18n";
import { dictionaries } from "@/lib/i18n";
import { getListingDetailLabels } from "@/lib/listing-detail-labels";
import { listingSchema, type ListingInput } from "@/lib/validation";

export type FieldErrors = Record<string, string>;

const optionalNullableFields = [
  "yearMonth",
  "priceEur",
  "financingDetails",
  "financeTermMonths",
  "seats",
  "doors",
  "color",
  "upholsteryPrimary",
  "upholsterySecondary",
  "curbWeightKg",
  "grossWeightKg",
  "trunkVolumeLiters",
  "climate",
  "roof",
  "engineDisplacementCcm",
  "powerKw",
  "powerHp",
  "cylinderLayout",
  "driveType",
  "gearboxDetail",
  "batteryCapacityPercent",
  "acChargerType",
  "wltpRangeKm",
  "systemPowerKw",
  "systemPowerHp",
  "documentsType",
  "inspectionValidUntil",
  "frontTireSize",
  "rearTireSize",
  "interiorFeatures",
  "technicalFeatures",
  "exteriorFeatures",
  "multimediaFeatures",
  "extraInfo",
] as const;

const batteryFields = [
  "batteryCapacityPercent",
  "acChargerType",
  "wltpRangeKm",
  "systemPowerKw",
  "systemPowerHp",
] as const;

export function isElectrifiedFuel(fuel: string | undefined) {
  return fuel === "HYBRID" || fuel === "ELECTRIC";
}

export function getListingFieldLabels(locale: Locale): Record<string, string> {
  const t = dictionaries[locale];
  const detail = getListingDetailLabels(locale);

  return {
    make: t.forms.make,
    model: t.forms.model,
    trim: t.forms.trim,
    year: t.forms.year,
    price: t.forms.price,
    priceEur: detail.fields.purchasePriceEur,
    mileage: t.forms.mileage,
    fuel: t.listing.fuel,
    transmission: t.listing.transmission,
    bodyType: t.listing.bodyType,
    condition: t.listing.condition,
    location: t.forms.location,
    description: t.forms.description,
    status: t.forms.status,
    ...detail.fields,
  };
}

function genericError(locale: Locale) {
  return locale === "hu" ? "Ellenorizd a jelolt mezoket." : "Check the highlighted fields.";
}

function messageForIssue(issue: z.core.$ZodIssue, label: string, locale: Locale) {
  const minimum = "minimum" in issue ? issue.minimum : undefined;
  const maximum = "maximum" in issue ? issue.maximum : undefined;

  if (issue.code === "too_small" && typeof minimum !== "undefined") {
    return locale === "hu" ? `${label}: legalabb ${minimum}.` : `${label}: must be at least ${minimum}.`;
  }

  if (issue.code === "too_big" && typeof maximum !== "undefined") {
    return locale === "hu" ? `${label}: legfeljebb ${maximum}.` : `${label}: must be at most ${maximum}.`;
  }

  if (issue.code === "invalid_value") {
    return locale === "hu" ? `${label}: ervenytelen ertek.` : `${label}: invalid value.`;
  }

  return `${label}: ${issue.message}`;
}

function zodFieldErrors(error: z.ZodError, locale: Locale) {
  const labels = getListingFieldLabels(locale);
  const fieldErrors: FieldErrors = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    const label = labels[field] ?? field;
    fieldErrors[field] ??= messageForIssue(issue, label, locale);
  }

  return fieldErrors;
}

function addError(fieldErrors: FieldErrors, field: string, message: string) {
  fieldErrors[field] ??= message;
}

function runQualityChecks(data: ListingInput, locale: Locale) {
  const labels = getListingFieldLabels(locale);
  const fieldErrors: FieldErrors = {};
  const fakeValueMessage =
    locale === "hu"
      ? "Hagyd uresen, ha nem ismert vagy nem relevans. Ne adj meg helykitolto erteket."
      : "Leave this blank if unknown or not relevant. Do not enter placeholder values.";

  if (/_{2,}|__\.?\s*kerület|\+36\s*00\s*000\s*000/i.test(data.description)) {
    addError(
      fieldErrors,
      "description",
      locale === "hu"
        ? `${labels.description}: ne tartalmazzon helykitolto cimet vagy telefonszamot.`
        : `${labels.description}: must not contain placeholder address or phone text.`,
    );
  }

  for (const field of ["powerKw", "powerHp", "systemPowerKw", "systemPowerHp"] as const) {
    if (data[field] === 1) {
      addError(fieldErrors, field, `${labels[field]}: ${fakeValueMessage}`);
    }
  }

  if (data.batteryCapacityPercent === 1) {
    addError(fieldErrors, "batteryCapacityPercent", `${labels.batteryCapacityPercent}: ${fakeValueMessage}`);
  }

  if (data.wltpRangeKm === 1) {
    addError(fieldErrors, "wltpRangeKm", `${labels.wltpRangeKm}: ${fakeValueMessage}`);
  }

  if (data.acChargerType === "1") {
    addError(fieldErrors, "acChargerType", `${labels.acChargerType}: ${fakeValueMessage}`);
  }

  return fieldErrors;
}

export function normalizeListingInput(data: ListingInput) {
  const normalized: Record<string, unknown> = { ...data };

  if (!isElectrifiedFuel(data.fuel)) {
    for (const field of batteryFields) {
      normalized[field] = undefined;
    }
    normalized.fastCharging = false;
  }

  for (const field of optionalNullableFields) {
    if (normalized[field] === undefined || normalized[field] === "") {
      normalized[field] = null;
    }
  }

  normalized.trim = data.trim || null;

  return normalized as Omit<ListingInput, "trim"> & {
    trim: string | null;
  };
}

export function validateListingPayload(raw: Record<string, string>, locale: Locale) {
  const prepared = { ...raw };

  if (!isElectrifiedFuel(prepared.fuel)) {
    for (const field of batteryFields) {
      prepared[field] = "";
    }
    prepared.fastCharging = "false";
  }

  const parsed = listingSchema.safeParse(prepared);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: genericError(locale),
      fieldErrors: zodFieldErrors(parsed.error, locale),
    };
  }

  const qualityErrors = runQualityChecks(parsed.data, locale);

  if (Object.keys(qualityErrors).length > 0) {
    return {
      ok: false as const,
      error: genericError(locale),
      fieldErrors: qualityErrors,
    };
  }

  return {
    ok: true as const,
    data: normalizeListingInput(parsed.data),
  };
}
