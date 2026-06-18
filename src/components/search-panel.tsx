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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import {
  bodyTypeOptions,
  conditionOptions,
  fuelOptions,
  transmissionOptions,
} from "@/lib/options";
import { AUTOPIAC_BASE_PATH } from "@/lib/routes";

type SearchPanelProps = {
  locale: Locale;
  t: Dictionary;
  params: Record<string, string | string[] | undefined>;
};

function value(params: SearchPanelProps["params"], key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
}

export function SearchPanel({ locale, t, params }: SearchPanelProps) {
  const help =
    locale === "hu"
      ? {
          keyword: "Keres a markaban, modellben, kivitelben, leirasban es helysegben.",
          make: "Reszleges markanev is eleg.",
          model: "Reszleges modellnev is eleg.",
          priceMin: "Csak ennel dragabb vagy pontosan ilyen aru autok.",
          priceMax: "Csak ennel olcsobb vagy pontosan ilyen aru autok.",
          yearMin: "Legalabb ilyen evjaratu autok.",
          yearMax: "Legfeljebb ilyen evjaratu autok.",
          mileageMax: "Legfeljebb ekkora futasteljesitmeny.",
          fuel: "Pontosan erre az uzemanyag tipusra szur.",
          transmission: "Pontosan erre a valto tipusra szur.",
          bodyType: "Pontosan erre a karosszeria kivitelre szur.",
          condition: "Pontosan erre az allapotra szur.",
          location: "Reszleges helyseg vagy varosnev is eleg.",
        }
      : {
          keyword: "Searches make, model, trim, description, and location.",
          make: "Partial make names are accepted.",
          model: "Partial model names are accepted.",
          priceMin: "Only cars at or above this HUF price.",
          priceMax: "Only cars at or below this HUF price.",
          yearMin: "Only cars from this year or newer.",
          yearMax: "Only cars from this year or older.",
          mileageMax: "Only cars with mileage at or below this value.",
          fuel: "Filters by the exact fuel category.",
          transmission: "Filters by the exact transmission category.",
          bodyType: "Filters by the exact body category.",
          condition: "Filters by the exact condition category.",
          location: "Partial town or city names are accepted.",
        };
  const fields: FilterField[] = [
    { kind: "text", name: "keyword", label: t.filters.keyword, icon: Search, help: help.keyword },
    { kind: "text", name: "make", label: t.filters.make, icon: Car, help: help.make },
    { kind: "text", name: "model", label: t.filters.model, icon: Car, help: help.model },
    { kind: "number", name: "priceMin", label: t.filters.priceMin, icon: CircleDollarSign, help: help.priceMin },
    { kind: "number", name: "priceMax", label: t.filters.priceMax, icon: CircleDollarSign, help: help.priceMax },
    { kind: "number", name: "yearMin", label: t.filters.yearMin, icon: Calendar, help: help.yearMin },
    { kind: "number", name: "yearMax", label: t.filters.yearMax, icon: Calendar, help: help.yearMax },
    { kind: "number", name: "mileageMax", label: t.filters.mileageMax, icon: Gauge, help: help.mileageMax },
    { kind: "select", name: "fuel", label: t.filters.fuel, icon: Fuel, help: help.fuel, options: fuelOptions, labels: t.enums.fuel },
    {
      kind: "select",
      name: "transmission",
      label: t.filters.transmission,
      icon: Settings2,
      help: help.transmission,
      options: transmissionOptions,
      labels: t.enums.transmission,
    },
    { kind: "select", name: "bodyType", label: t.filters.bodyType, icon: Car, help: help.bodyType, options: bodyTypeOptions, labels: t.enums.bodyType },
    {
      kind: "select",
      name: "condition",
      label: t.filters.condition,
      icon: Sparkles,
      help: help.condition,
      options: conditionOptions,
      labels: t.enums.condition,
    },
    { kind: "text", name: "location", label: t.filters.location, icon: MapPin, help: help.location },
  ];

  return (
    <form action={AUTOPIAC_BASE_PATH} className="glass-panel space-y-5 rounded-lg p-4">
      <input type="hidden" name="lang" value={locale} />
      {value(params, "view") === "list" && <input type="hidden" name="view" value="list" />}
      <div className="flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-base font-black text-slate-950">
          <SlidersHorizontal className="h-5 w-5 text-[var(--accent-aqua)]" aria-hidden="true" />
          {t.filters.title}
        </h2>
        <a
          href={`${AUTOPIAC_BASE_PATH}?lang=${locale}`}
          className="liquid-button-secondary inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-slate-500 transition hover:text-slate-900"
          aria-label={t.home.resetFilters}
          title={t.home.resetFilters}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <div className="grid gap-3">
        {fields.map((field) => (
          <FilterControl key={field.name} field={field} params={params} anyLabel={t.filters.any} />
        ))}
      </div>

      <button
        type="submit"
        className="liquid-button-primary inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-black text-white transition"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        {t.filters.submit}
      </button>
    </form>
  );
}

type FilterField =
  | {
      kind: "text" | "number";
      name: string;
      label: string;
      help: string;
      icon: LucideIcon;
    }
  | {
      kind: "select";
      name: string;
      label: string;
      help: string;
      icon: LucideIcon;
      options: readonly string[];
      labels: Record<string, string>;
    };

function FilterControl({
  field,
  params,
  anyLabel,
}: {
  field: FilterField;
  params: SearchPanelProps["params"];
  anyLabel: string;
}) {
  const Icon = field.icon;

  return (
    <label className="group relative block">
      <span className="sr-only">{field.label}</span>
      <Icon
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--accent-aqua)]"
        aria-hidden="true"
      />
      {field.kind === "select" ? (
        <select
          name={field.name}
          defaultValue={value(params, field.name)}
          aria-label={field.label}
          title={field.help}
          className="h-10 w-full px-10 font-normal outline-none transition"
        >
          <option value="">{anyLabel}</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {field.labels[option]}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={field.name}
          type={field.kind === "number" ? "number" : "text"}
          inputMode={field.kind === "number" ? "numeric" : undefined}
          defaultValue={value(params, field.name)}
          placeholder={field.label}
          aria-label={field.label}
          title={field.help}
          className="h-10 w-full px-10 font-normal outline-none transition"
        />
      )}
      <span className="pointer-events-none absolute left-0 top-[calc(100%+0.35rem)] z-20 hidden max-w-[18rem] rounded-lg border border-white/70 bg-slate-950/90 px-3 py-2 text-xs font-semibold leading-5 text-white shadow-xl backdrop-blur group-focus-within:block group-hover:block">
        {field.help}
      </span>
    </label>
  );
}
