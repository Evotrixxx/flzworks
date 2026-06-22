import {
  Calendar,
  Car,
  CircleDollarSign,
  Fuel,
  Gauge,
  MapPin,
  RotateCcw,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { bodyTypeOptions, conditionOptions, fuelOptions, transmissionOptions } from "@/lib/options";
import { AUTOPIAC_BASE_PATH } from "@/lib/routes";
import type { SearchParamsInput } from "@/lib/listings";

type ShowroomSearchPanelProps = {
  locale: Locale;
  t: Dictionary;
  params: SearchParamsInput;
  mode?: "hero" | "compact";
};

function value(params: SearchParamsInput, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
}

function checked(params: SearchParamsInput, key: string) {
  return ["true", "on", "1"].includes(value(params, key));
}

const driveTypeOptions = ["Elsőkerék", "Hátsókerék", "Összkerék"] as const;

export function ShowroomSearchPanel({ locale, t, params, mode = "hero" }: ShowroomSearchPanelProps) {
  const compact = mode === "compact";
  const copy =
    locale === "hu"
      ? {
          title: "Autó kereső",
          subtitle: "Gyors szűrés a készletben",
          advanced: "Még több paraméter",
          drivetrain: "Meghajtás",
          greenPlate: "Zöldrendszámos",
          orderable: "Rendelhetők is",
          reset: "Törlés",
          from: "tól",
          to: "ig",
          immediatelyHint: "A rendelhető készletet is mutatja.",
          make: "Márka",
          model: "Modell",
          fuel: "Üzemanyag",
          transmission: "Váltó",
          keyword: "Kulcsszó",
          mileageMax: "Futás max.",
          bodyType: "Kivitel",
          condition: "Állapot",
          location: "Helység",
        }
      : {
          title: "Car search",
          subtitle: "Fast inventory filtering",
          advanced: "More parameters",
          drivetrain: "Drivetrain",
          greenPlate: "Green plate",
          orderable: "Orderable too",
          reset: "Reset",
          from: "from",
          to: "to",
          immediatelyHint: "Also shows orderable inventory.",
          make: t.filters.make,
          model: t.filters.model,
          fuel: t.filters.fuel,
          transmission: t.filters.transmission,
          keyword: t.filters.keyword,
          mileageMax: t.filters.mileageMax,
          bodyType: t.filters.bodyType,
          condition: t.filters.condition,
          location: t.filters.location,
        };
  const controls = (
    <>
      <div className="showroom-search__grid">
        <TextField icon={Car} name="make" label={copy.make} params={params} />
        <TextField icon={Car} name="model" label={copy.model} params={params} />
        <RangeField
          icon={Calendar}
          label={locale === "hu" ? "Évjárat" : "Year"}
          fromLabel={copy.from}
          toLabel={copy.to}
          minName="yearMin"
          maxName="yearMax"
          params={params}
        />
        <RangeField
          icon={CircleDollarSign}
          label={locale === "hu" ? "Vételár" : "Price"}
          fromLabel={copy.from}
          toLabel={copy.to}
          minName="priceMin"
          maxName="priceMax"
          params={params}
        />
        <SelectField
          icon={Fuel}
          name="fuel"
          label={copy.fuel}
          params={params}
          anyLabel={t.filters.any}
          options={fuelOptions}
          labels={t.enums.fuel}
        />
        <SelectField
          icon={Zap}
          name="driveType"
          label={copy.drivetrain}
          params={params}
          anyLabel={t.filters.any}
          options={driveTypeOptions}
          labels={{ Elsőkerék: "Elsőkerék", Hátsókerék: "Hátsókerék", Összkerék: "Összkerék" }}
        />
        <SelectField
          icon={Settings2}
          name="transmission"
          label={copy.transmission}
          params={params}
          anyLabel={t.filters.any}
          options={transmissionOptions}
          labels={t.enums.transmission}
        />
      </div>

      <div className="showroom-toggle-row">
        <ToggleField name="greenPlate" label={copy.greenPlate} params={params} />
        <ToggleField name="orderable" label={copy.orderable} params={params} title={copy.immediatelyHint} />
      </div>

      <details className="showroom-advanced">
        <summary>
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {copy.advanced}
          </span>
        </summary>
        <div className="showroom-search__grid showroom-search__grid--advanced">
          <TextField icon={Search} name="keyword" label={copy.keyword} params={params} />
          <NumberField icon={Gauge} name="mileageMax" label={copy.mileageMax} params={params} />
          <SelectField
            icon={Car}
            name="bodyType"
            label={copy.bodyType}
            params={params}
            anyLabel={t.filters.any}
            options={bodyTypeOptions}
            labels={t.enums.bodyType}
          />
          <SelectField
            icon={Sparkles}
            name="condition"
            label={copy.condition}
            params={params}
            anyLabel={t.filters.any}
            options={conditionOptions}
            labels={t.enums.condition}
          />
          <TextField icon={MapPin} name="location" label={copy.location} params={params} />
        </div>
      </details>

      <button type="submit" className="liquid-button-primary showroom-submit">
        <Search className="h-4 w-4" aria-hidden="true" />
        {t.filters.submit}
      </button>
    </>
  );

  return (
    <form
      action={AUTOPIAC_BASE_PATH}
      className={`showroom-search glass-surface ${compact ? "showroom-search--compact" : ""}`}
    >
      <input type="hidden" name="lang" value={locale} />
      <input type="hidden" name="searched" value="1" />
      {value(params, "view") === "list" && <input type="hidden" name="view" value="list" />}

      <div className="showroom-search__head">
        <div>
          <p className="showroom-kicker">{copy.subtitle}</p>
          <h1>{copy.title}</h1>
        </div>
        <a
          href={`${AUTOPIAC_BASE_PATH}?lang=${locale}`}
          className="liquid-button-secondary inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700"
          aria-label={copy.reset}
          title={copy.reset}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      {compact ? (
        <details className="showroom-compact-drawer">
          <summary>
            <span className="inline-flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              {locale === "hu" ? "Szűrők megnyitása" : "Open filters"}
            </span>
          </summary>
          <div className="showroom-compact-drawer__body">{controls}</div>
        </details>
      ) : (
        controls
      )}
    </form>
  );
}

function FieldShell({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="showroom-field">
      <span className="showroom-field__label">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </span>
      {children}
    </label>
  );
}

function TextField({
  icon,
  name,
  label,
  params,
}: {
  icon: LucideIcon;
  name: string;
  label: string;
  params: SearchParamsInput;
}) {
  return (
    <FieldShell icon={icon} label={label}>
      <input name={name} defaultValue={value(params, name)} placeholder={label} />
    </FieldShell>
  );
}

function NumberField({
  icon,
  name,
  label,
  params,
}: {
  icon: LucideIcon;
  name: string;
  label: string;
  params: SearchParamsInput;
}) {
  return (
    <FieldShell icon={icon} label={label}>
      <input name={name} type="number" inputMode="numeric" defaultValue={value(params, name)} placeholder={label} />
    </FieldShell>
  );
}

function RangeField({
  icon,
  label,
  fromLabel,
  toLabel,
  minName,
  maxName,
  params,
}: {
  icon: LucideIcon;
  label: string;
  fromLabel: string;
  toLabel: string;
  minName: string;
  maxName: string;
  params: SearchParamsInput;
}) {
  return (
    <FieldShell icon={icon} label={label}>
      <div className="showroom-range">
        <input name={minName} type="number" inputMode="numeric" defaultValue={value(params, minName)} placeholder={fromLabel} />
        <input name={maxName} type="number" inputMode="numeric" defaultValue={value(params, maxName)} placeholder={toLabel} />
      </div>
    </FieldShell>
  );
}

function SelectField<T extends string>({
  icon,
  name,
  label,
  params,
  anyLabel,
  options,
  labels,
}: {
  icon: LucideIcon;
  name: string;
  label: string;
  params: SearchParamsInput;
  anyLabel: string;
  options: readonly T[];
  labels: Record<T, string>;
}) {
  return (
    <FieldShell icon={icon} label={label}>
      <select name={name} defaultValue={value(params, name)} aria-label={label}>
        <option value="">{anyLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option]}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

function ToggleField({
  name,
  label,
  params,
  title,
}: {
  name: string;
  label: string;
  params: SearchParamsInput;
  title?: string;
}) {
  return (
    <label className="showroom-toggle" title={title}>
      <input type="checkbox" name={name} value="true" defaultChecked={checked(params, name)} />
      <span>{label}</span>
    </label>
  );
}
