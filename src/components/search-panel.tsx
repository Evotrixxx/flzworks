import { Search, SlidersHorizontal, X } from "lucide-react";
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
    { name: "fuel", label: t.filters.fuel, options: fuelOptions, labels: t.enums.fuel },
    {
      name: "transmission",
      label: t.filters.transmission,
      options: transmissionOptions,
      labels: t.enums.transmission,
    },
    { name: "bodyType", label: t.filters.bodyType, options: bodyTypeOptions, labels: t.enums.bodyType },
    { name: "condition", label: t.filters.condition, options: conditionOptions, labels: t.enums.condition },
  ];

  return (
    <form action="/" className="glass-panel space-y-4 rounded-lg p-4">
      <input type="hidden" name="lang" value={locale} />
      <div className="flex items-center justify-between gap-3">
        <h2 className="inline-flex items-center gap-2 text-base font-black text-slate-950">
          <SlidersHorizontal className="h-5 w-5 text-cyan-700" aria-hidden="true" />
          {t.filters.title}
        </h2>
        <a
          href={`/?lang=${locale}`}
          className="inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs font-semibold text-slate-500 transition hover:bg-white/70 hover:text-slate-900"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          {t.home.resetFilters}
        </a>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {t.filters.keyword}
          <input
            name="keyword"
            defaultValue={value(params, "keyword")}
            className="h-10 px-3 font-normal outline-none transition"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            {t.filters.make}
            <input
              name="make"
              defaultValue={value(params, "make")}
              className="h-10 px-3 font-normal outline-none transition"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            {t.filters.model}
            <input
              name="model"
              defaultValue={value(params, "model")}
              className="h-10 px-3 font-normal outline-none transition"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            {t.filters.priceMin}
            <input
              name="priceMin"
              type="number"
              inputMode="numeric"
              defaultValue={value(params, "priceMin")}
              className="h-10 px-3 font-normal outline-none transition"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            {t.filters.priceMax}
            <input
              name="priceMax"
              type="number"
              inputMode="numeric"
              defaultValue={value(params, "priceMax")}
              className="h-10 px-3 font-normal outline-none transition"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            {t.filters.yearMin}
            <input
              name="yearMin"
              type="number"
              inputMode="numeric"
              defaultValue={value(params, "yearMin")}
              className="h-10 px-3 font-normal outline-none transition"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            {t.filters.yearMax}
            <input
              name="yearMax"
              type="number"
              inputMode="numeric"
              defaultValue={value(params, "yearMax")}
              className="h-10 px-3 font-normal outline-none transition"
            />
          </label>
        </div>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {t.filters.mileageMax}
          <input
            name="mileageMax"
            type="number"
            inputMode="numeric"
            defaultValue={value(params, "mileageMax")}
            className="h-10 px-3 font-normal outline-none transition"
          />
        </label>

        {selectGroups.map((group) => (
          <label key={group.name} className="grid gap-1 text-sm font-semibold text-slate-700">
            {group.label}
            <select
              name={group.name}
              defaultValue={value(params, group.name)}
              className="h-10 px-3 font-normal outline-none transition"
            >
              <option value="">{t.filters.any}</option>
              {group.options.map((option) => (
                <option key={option} value={option}>
                  {group.labels[option as keyof typeof group.labels]}
                </option>
              ))}
            </select>
          </label>
        ))}

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {t.filters.location}
          <input
            name="location"
            defaultValue={value(params, "location")}
            className="h-10 px-3 font-normal outline-none transition"
          />
        </label>
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
