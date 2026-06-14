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
import type { ReactNode } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import {
  bodyTypeOptions,
  conditionOptions,
  fuelOptions,
  transmissionOptions,
} from "@/lib/options";

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
  const selectGroups = [
    { name: "fuel", label: t.filters.fuel, options: fuelOptions, labels: t.enums.fuel, icon: Fuel },
    {
      name: "transmission",
      label: t.filters.transmission,
      options: transmissionOptions,
      labels: t.enums.transmission,
      icon: Settings2,
    },
    { name: "bodyType", label: t.filters.bodyType, options: bodyTypeOptions, labels: t.enums.bodyType, icon: Car },
    { name: "condition", label: t.filters.condition, options: conditionOptions, labels: t.enums.condition, icon: Sparkles },
  ];
  const groupLabels =
    locale === "hu"
      ? {
          basics: "Alapok",
          priceYear: "Ar es evjarat",
          specs: "Jarmu adatok",
          place: "Hely",
        }
      : {
          basics: "Basics",
          priceYear: "Price & year",
          specs: "Vehicle specs",
          place: "Location",
        };
  const groups = {
    basics: { title: groupLabels.basics, icon: Search },
    priceYear: { title: groupLabels.priceYear, icon: CircleDollarSign },
    specs: { title: groupLabels.specs, icon: Gauge },
    place: { title: groupLabels.place, icon: MapPin },
  };

  return (
    <form action="/" className="glass-panel space-y-5 rounded-lg p-4">
      <input type="hidden" name="lang" value={locale} />
      {value(params, "view") === "list" && <input type="hidden" name="view" value="list" />}
      <div className="flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-base font-black text-slate-950">
          <SlidersHorizontal className="h-5 w-5 text-[var(--accent-aqua)]" aria-hidden="true" />
          {t.filters.title}
        </h2>
        <a
          href={`/?lang=${locale}`}
          className="liquid-button-secondary inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-slate-500 transition hover:text-slate-900"
          aria-label={t.home.resetFilters}
          title={t.home.resetFilters}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      <FilterGroup title={groups.basics.title} icon={groups.basics.icon}>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          <FieldLabel icon={Search}>{t.filters.keyword}</FieldLabel>
          <input name="keyword" defaultValue={value(params, "keyword")} className="h-10 px-3 font-normal outline-none transition" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            <FieldLabel icon={Car}>{t.filters.make}</FieldLabel>
            <input name="make" defaultValue={value(params, "make")} className="h-10 px-3 font-normal outline-none transition" />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            <FieldLabel icon={Car}>{t.filters.model}</FieldLabel>
            <input name="model" defaultValue={value(params, "model")} className="h-10 px-3 font-normal outline-none transition" />
          </label>
        </div>
      </FilterGroup>

      <FilterGroup title={groups.priceYear.title} icon={groups.priceYear.icon}>
        <div className="grid grid-cols-2 gap-3">
          <NumberField name="priceMin" label={t.filters.priceMin} params={params} icon={CircleDollarSign} />
          <NumberField name="priceMax" label={t.filters.priceMax} params={params} icon={CircleDollarSign} />
          <NumberField name="yearMin" label={t.filters.yearMin} params={params} icon={Calendar} />
          <NumberField name="yearMax" label={t.filters.yearMax} params={params} icon={Calendar} />
        </div>
      </FilterGroup>

      <FilterGroup title={groups.specs.title} icon={groups.specs.icon}>
        <NumberField name="mileageMax" label={t.filters.mileageMax} params={params} icon={Gauge} />
        {selectGroups.map((group) => (
          <label key={group.name} className="grid gap-1 text-sm font-semibold text-slate-700">
            <FieldLabel icon={group.icon}>{group.label}</FieldLabel>
            <select name={group.name} defaultValue={value(params, group.name)} className="h-10 px-3 font-normal outline-none transition">
              <option value="">{t.filters.any}</option>
              {group.options.map((option) => (
                <option key={option} value={option}>
                  {group.labels[option as keyof typeof group.labels]}
                </option>
              ))}
            </select>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title={groups.place.title} icon={groups.place.icon}>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          <FieldLabel icon={MapPin}>{t.filters.location}</FieldLabel>
          <input name="location" defaultValue={value(params, "location")} className="h-10 px-3 font-normal outline-none transition" />
        </label>
      </FilterGroup>

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

function FilterGroup({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <fieldset className="grid gap-3 border-t border-white/60 pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-3">
        <span className="glass-chip inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-black uppercase text-slate-600">
          <Icon className="h-3.5 w-3.5 text-[var(--accent-aqua)]" aria-hidden="true" />
          {title}
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

function FieldLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-[var(--accent-aqua)]" aria-hidden="true" />
      {children}
    </span>
  );
}

function NumberField({
  name,
  label,
  params,
  icon,
}: {
  name: string;
  label: string;
  params: SearchPanelProps["params"];
  icon: LucideIcon;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700">
      <FieldLabel icon={icon}>{label}</FieldLabel>
      <input
        name={name}
        type="number"
        inputMode="numeric"
        defaultValue={value(params, name)}
        className="h-10 px-3 font-normal outline-none transition"
      />
    </label>
  );
}
