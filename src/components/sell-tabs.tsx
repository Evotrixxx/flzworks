"use client";

import { useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { ListingForm } from "@/components/listing-form";
import { TextImportForm } from "@/components/text-import-form";

export function SellTabs({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [tab, setTab] = useState<"single" | "import">("single");
  const labels =
    locale === "hu"
      ? {
          single: "Egy hirdetes",
          import: "Szoveges import",
        }
      : {
          single: "Single listing",
          import: "Text import",
        };

  return (
    <div className="grid gap-5">
      <div className="glass-chip grid w-full grid-cols-2 rounded-full p-1 text-sm font-black text-slate-600 sm:w-fit">
        <button
          type="button"
          onClick={() => setTab("single")}
          className={`h-10 rounded-full px-4 transition ${tab === "single" ? "theme-active-pill" : "hover:bg-white/70 hover:text-slate-950"}`}
        >
          {labels.single}
        </button>
        <button
          type="button"
          onClick={() => setTab("import")}
          className={`h-10 rounded-full px-4 transition ${tab === "import" ? "theme-active-pill" : "hover:bg-white/70 hover:text-slate-950"}`}
        >
          {labels.import}
        </button>
      </div>

      {tab === "single" ? <ListingForm mode="create" locale={locale} t={t} /> : <TextImportForm locale={locale} />}
    </div>
  );
}
