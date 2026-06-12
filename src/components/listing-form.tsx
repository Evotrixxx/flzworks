"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Save } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import {
  bodyTypeOptions,
  conditionOptions,
  fuelOptions,
  listingStatusOptions,
  transmissionOptions,
} from "@/lib/options";
import { photoUrl } from "@/lib/format";
import { getListingDetailLabels } from "@/lib/listing-detail-labels";
import { isElectrifiedFuel, type FieldErrors } from "@/lib/listing-validation";

type InitialListing = {
  [key: string]: unknown;
  id: string;
  make: string;
  model: string;
  trim: string | null;
  yearMonth: string | null;
  year: number;
  price: number;
  priceEur: number | null;
  mileage: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  condition: string;
  location: string;
  description: string;
  status: string;
  photos: { path: string }[];
};

export function ListingForm({
  mode,
  locale,
  t,
  initialListing,
}: {
  mode: "create" | "edit";
  locale: Locale;
  t: Dictionary;
  initialListing?: InitialListing;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [selectedFuel, setSelectedFuel] = useState(initialListing?.fuel ?? fuelOptions[0]);
  const detailLabels = getListingDetailLabels(locale);
  const showBatteryFields = isElectrifiedFuel(selectedFuel);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const response = await fetch(mode === "create" ? "/api/listings" : `/api/listings/${initialListing?.id}`, {
      method: mode === "create" ? "POST" : "PUT",
      body: formData,
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        fieldErrors?: FieldErrors;
      } | null;
      setError(payload?.error ?? t.forms.error);
      setFieldErrors(payload?.fieldErrors ?? {});
      setPending(false);
      return;
    }

    const payload = (await response.json()) as { id: string };
    router.push(`/cars/${payload.id}?lang=${locale}`);
    router.refresh();
  }

  const selectGroups = [
    { name: "fuel", label: t.listing.fuel, options: fuelOptions, labels: t.enums.fuel },
    { name: "transmission", label: t.listing.transmission, options: transmissionOptions, labels: t.enums.transmission },
    { name: "bodyType", label: t.listing.bodyType, options: bodyTypeOptions, labels: t.enums.bodyType },
    { name: "condition", label: t.listing.condition, options: conditionOptions, labels: t.enums.condition },
  ];

  function getDefaultValue(name: string) {
    const value = initialListing?.[name];
    return typeof value === "string" || typeof value === "number" ? value : "";
  }

  function getDefaultChecked(name: string, defaultValue = false) {
    const value = initialListing?.[name];
    return typeof value === "boolean" ? value : defaultValue;
  }

  function fieldError(name: string) {
    return fieldErrors[name];
  }

  return (
    <form onSubmit={submit} className="glass-panel grid gap-5 rounded-lg p-5">
      <input type="hidden" name="lang" value={locale} />

      <DetailSection title={t.forms.listingTitle}>
        <Field label={t.forms.make} name="make" defaultValue={initialListing?.make} error={fieldError("make")} required />
        <Field label={t.forms.model} name="model" defaultValue={initialListing?.model} error={fieldError("model")} required />
        <Field label={t.forms.trim} name="trim" defaultValue={initialListing?.trim ?? ""} error={fieldError("trim")} />
        <Field label={t.forms.location} name="location" defaultValue={initialListing?.location} error={fieldError("location")} required />
        <Field label={detailLabels.fields.yearMonth} name="yearMonth" defaultValue={initialListing?.yearMonth} error={fieldError("yearMonth")} />
        <Field label={t.forms.year} name="year" type="number" defaultValue={initialListing?.year} error={fieldError("year")} required />
        <Field label={t.forms.price} name="price" type="number" defaultValue={initialListing?.price} error={fieldError("price")} required />
        <Field
          label={detailLabels.fields.purchasePriceEur}
          name="priceEur"
          type="number"
          defaultValue={initialListing?.priceEur}
          error={fieldError("priceEur")}
        />
        <Field label={t.forms.mileage} name="mileage" type="number" defaultValue={initialListing?.mileage} error={fieldError("mileage")} required />

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {t.forms.status}
          <select
            name="status"
            defaultValue={initialListing?.status ?? "PUBLISHED"}
            className="h-11 px-3 font-normal outline-none transition"
          >
            {listingStatusOptions.map((option) => (
              <option key={option} value={option}>
                {t.enums.status[option]}
              </option>
            ))}
          </select>
          {fieldError("status") && <span className="text-xs font-semibold text-rose-700">{fieldError("status")}</span>}
        </label>

        {selectGroups.map((group) => (
          <label key={group.name} className="grid gap-1 text-sm font-semibold text-slate-700">
            {group.label}
            <select
              name={group.name}
              defaultValue={(initialListing?.[group.name as keyof InitialListing] as string | undefined) ?? group.options[0]}
              onChange={group.name === "fuel" ? (event) => setSelectedFuel(event.target.value) : undefined}
              className="h-11 px-3 font-normal outline-none transition"
            >
              {group.options.map((option) => (
                <option key={option} value={option}>
                  {group.labels[option as keyof typeof group.labels]}
                </option>
              ))}
            </select>
            {fieldError(group.name) && <span className="text-xs font-semibold text-rose-700">{fieldError(group.name)}</span>}
          </label>
        ))}
      </DetailSection>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        {t.forms.description}
        <textarea
          name="description"
          required
          rows={7}
          defaultValue={initialListing?.description}
          className="px-3 py-2 font-normal leading-6 outline-none transition"
        />
        {fieldError("description") && <span className="text-xs font-semibold text-rose-700">{fieldError("description")}</span>}
      </label>

      <DetailSection title={detailLabels.sections.financing}>
        <Field
          label={detailLabels.fields.financingDetails}
          name="financingDetails"
          defaultValue={getDefaultValue("financingDetails")}
          error={fieldError("financingDetails")}
        />
        <Field
          label={detailLabels.fields.financeTermMonths}
          name="financeTermMonths"
          type="number"
          defaultValue={getDefaultValue("financeTermMonths")}
          error={fieldError("financeTermMonths")}
        />
      </DetailSection>

      <DetailSection title={detailLabels.sections.vehicle}>
        <Field label={detailLabels.fields.seats} name="seats" type="number" defaultValue={getDefaultValue("seats")} error={fieldError("seats")} />
        <Field label={detailLabels.fields.doors} name="doors" type="number" defaultValue={getDefaultValue("doors")} error={fieldError("doors")} />
        <Field label={detailLabels.fields.color} name="color" defaultValue={getDefaultValue("color")} error={fieldError("color")} />
        <Field
          label={detailLabels.fields.upholsteryPrimary}
          name="upholsteryPrimary"
          defaultValue={getDefaultValue("upholsteryPrimary")}
          error={fieldError("upholsteryPrimary")}
        />
        <Field
          label={detailLabels.fields.upholsterySecondary}
          name="upholsterySecondary"
          defaultValue={getDefaultValue("upholsterySecondary")}
          error={fieldError("upholsterySecondary")}
        />
        <Field
          label={detailLabels.fields.curbWeightKg}
          name="curbWeightKg"
          type="number"
          defaultValue={getDefaultValue("curbWeightKg")}
          error={fieldError("curbWeightKg")}
        />
        <Field
          label={detailLabels.fields.grossWeightKg}
          name="grossWeightKg"
          type="number"
          defaultValue={getDefaultValue("grossWeightKg")}
          error={fieldError("grossWeightKg")}
        />
        <Field
          label={detailLabels.fields.trunkVolumeLiters}
          name="trunkVolumeLiters"
          type="number"
          defaultValue={getDefaultValue("trunkVolumeLiters")}
          error={fieldError("trunkVolumeLiters")}
        />
        <Field label={detailLabels.fields.climate} name="climate" defaultValue={getDefaultValue("climate")} error={fieldError("climate")} />
        <Field label={detailLabels.fields.roof} name="roof" defaultValue={getDefaultValue("roof")} error={fieldError("roof")} />
      </DetailSection>

      <DetailSection title={detailLabels.sections.motor}>
        <Field
          label={detailLabels.fields.engineDisplacementCcm}
          name="engineDisplacementCcm"
          type="number"
          defaultValue={getDefaultValue("engineDisplacementCcm")}
          error={fieldError("engineDisplacementCcm")}
        />
        <Field label={detailLabels.fields.powerKw} name="powerKw" type="number" defaultValue={getDefaultValue("powerKw")} error={fieldError("powerKw")} />
        <Field label={detailLabels.fields.powerHp} name="powerHp" type="number" defaultValue={getDefaultValue("powerHp")} error={fieldError("powerHp")} />
        <Field label={detailLabels.fields.cylinderLayout} name="cylinderLayout" defaultValue={getDefaultValue("cylinderLayout")} error={fieldError("cylinderLayout")} />
        <Field label={detailLabels.fields.driveType} name="driveType" defaultValue={getDefaultValue("driveType")} error={fieldError("driveType")} />
        <Field label={detailLabels.fields.gearboxDetail} name="gearboxDetail" defaultValue={getDefaultValue("gearboxDetail")} error={fieldError("gearboxDetail")} />
      </DetailSection>

      {showBatteryFields ? (
        <DetailSection title={detailLabels.sections.battery}>
          <Field
            label={detailLabels.fields.batteryCapacityPercent}
            name="batteryCapacityPercent"
            type="number"
            defaultValue={getDefaultValue("batteryCapacityPercent")}
            error={fieldError("batteryCapacityPercent")}
          />
          <Field label={detailLabels.fields.acChargerType} name="acChargerType" defaultValue={getDefaultValue("acChargerType")} error={fieldError("acChargerType")} />
          <Field label={detailLabels.fields.wltpRangeKm} name="wltpRangeKm" type="number" defaultValue={getDefaultValue("wltpRangeKm")} error={fieldError("wltpRangeKm")} />
          <Field
            label={detailLabels.fields.systemPowerKw}
            name="systemPowerKw"
            type="number"
            defaultValue={getDefaultValue("systemPowerKw")}
            error={fieldError("systemPowerKw")}
          />
          <Field
            label={detailLabels.fields.systemPowerHp}
            name="systemPowerHp"
            type="number"
            defaultValue={getDefaultValue("systemPowerHp")}
            error={fieldError("systemPowerHp")}
          />
          <CheckboxField
            label={detailLabels.fields.fastCharging}
            name="fastCharging"
            defaultChecked={getDefaultChecked("fastCharging")}
            error={fieldError("fastCharging")}
          />
        </DetailSection>
      ) : (
        <>
          {["batteryCapacityPercent", "acChargerType", "wltpRangeKm", "systemPowerKw", "systemPowerHp"].map((name) => (
            <input key={name} type="hidden" name={name} value="" />
          ))}
          <input type="hidden" name="fastCharging" value="false" />
        </>
      )}

      <DetailSection title={`${detailLabels.sections.documents} / ${detailLabels.sections.tires}`}>
        <Field label={detailLabels.fields.documentsType} name="documentsType" defaultValue={getDefaultValue("documentsType")} error={fieldError("documentsType")} />
        <Field
          label={detailLabels.fields.inspectionValidUntil}
          name="inspectionValidUntil"
          defaultValue={getDefaultValue("inspectionValidUntil")}
          error={fieldError("inspectionValidUntil")}
        />
        <Field label={detailLabels.fields.frontTireSize} name="frontTireSize" defaultValue={getDefaultValue("frontTireSize")} error={fieldError("frontTireSize")} />
        <Field label={detailLabels.fields.rearTireSize} name="rearTireSize" defaultValue={getDefaultValue("rearTireSize")} error={fieldError("rearTireSize")} />
      </DetailSection>

      <DetailSection title={detailLabels.sections.history}>
        <CheckboxField
          label={detailLabels.fields.historyInternationalEnabled}
          name="historyInternationalEnabled"
          defaultChecked={getDefaultChecked("historyInternationalEnabled", true)}
          error={fieldError("historyInternationalEnabled")}
        />
        <CheckboxField
          label={detailLabels.fields.historyDomesticEnabled}
          name="historyDomesticEnabled"
          defaultChecked={getDefaultChecked("historyDomesticEnabled", true)}
          error={fieldError("historyDomesticEnabled")}
        />
        <CheckboxField
          label={detailLabels.fields.vatDeductible}
          name="vatDeductible"
          defaultChecked={getDefaultChecked("vatDeductible")}
          error={fieldError("vatDeductible")}
        />
        <CheckboxField
          label={detailLabels.fields.tradeInAvailable}
          name="tradeInAvailable"
          defaultChecked={getDefaultChecked("tradeInAvailable")}
          error={fieldError("tradeInAvailable")}
        />
        <CheckboxField
          label={detailLabels.fields.availableImmediately}
          name="availableImmediately"
          defaultChecked={getDefaultChecked("availableImmediately", true)}
          error={fieldError("availableImmediately")}
        />
      </DetailSection>

      <section className="grid gap-4">
        <h2 className="text-base font-black text-slate-950">{detailLabels.sections.equipment}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextAreaField
            label={detailLabels.sections.interior}
            name="interiorFeatures"
            defaultValue={getDefaultValue("interiorFeatures")}
            error={fieldError("interiorFeatures")}
          />
          <TextAreaField
            label={detailLabels.sections.technical}
            name="technicalFeatures"
            defaultValue={getDefaultValue("technicalFeatures")}
            error={fieldError("technicalFeatures")}
          />
          <TextAreaField
            label={detailLabels.sections.exterior}
            name="exteriorFeatures"
            defaultValue={getDefaultValue("exteriorFeatures")}
            error={fieldError("exteriorFeatures")}
          />
          <TextAreaField
            label={detailLabels.sections.multimedia}
            name="multimediaFeatures"
            defaultValue={getDefaultValue("multimediaFeatures")}
            error={fieldError("multimediaFeatures")}
          />
          <TextAreaField label={detailLabels.sections.extra} name="extraInfo" defaultValue={getDefaultValue("extraInfo")} error={fieldError("extraInfo")} />
        </div>
      </section>

      {initialListing?.photos.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {initialListing.photos.map((photo) => (
            <Image
              key={photo.path}
              src={photoUrl(photo.path)}
              alt=""
              width={240}
              height={180}
              className="aspect-[4/3] rounded-lg border border-white/70 object-cover shadow-sm"
            />
          ))}
        </div>
      ) : null}

      <label className="glass-chip grid gap-2 rounded-lg border-dashed p-4 text-sm font-semibold text-slate-700">
        <span className="inline-flex items-center gap-2">
          <Camera className="h-4 w-4 text-cyan-700" aria-hidden="true" />
          {t.forms.photos}
        </span>
        <input name="photos" type="file" accept="image/png,image/jpeg,image/webp" multiple className="text-sm" />
        <span className="text-xs font-semibold text-slate-500">{t.forms.photosHelp}</span>
      </label>

      {error && <p className="rounded-lg bg-rose-50/80 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="liquid-button-primary inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-black text-white transition disabled:opacity-60"
      >
        <Save className="h-4 w-4" aria-hidden="true" />
        {mode === "create" ? t.forms.publish : t.forms.update}
      </button>
    </form>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <h2 className="text-base font-black text-slate-950">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        aria-invalid={Boolean(error)}
        className={`h-11 px-3 font-normal outline-none transition ${
          error ? "border-rose-300 bg-rose-50" : "border-slate-200"
        }`}
      />
      {error && <span className="text-xs font-semibold text-rose-700">{error}</span>}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  error?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700">
      {label}
      <textarea
        name={name}
        rows={7}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(error)}
        className={`px-3 py-2 font-normal leading-6 outline-none transition ${
          error ? "border-rose-300 bg-rose-50" : "border-slate-200"
        }`}
      />
      {error && <span className="text-xs font-semibold text-rose-700">{error}</span>}
    </label>
  );
}

function CheckboxField({
  label,
  name,
  defaultChecked,
  error,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  error?: string;
}) {
  return (
    <div className="grid gap-1">
      <label
        className={`glass-chip flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-700 ${
          error ? "border-rose-300 bg-rose-50" : ""
        }`}
      >
        <input type="hidden" name={name} value="false" />
        <input
          name={name}
          type="checkbox"
          value="true"
          defaultChecked={defaultChecked}
          aria-invalid={Boolean(error)}
          className="h-4 w-4 accent-cyan-700"
        />
        {label}
      </label>
      {error && <span className="text-xs font-semibold text-rose-700">{error}</span>}
    </div>
  );
}
