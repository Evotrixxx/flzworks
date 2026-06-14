import type { Dictionary, Locale } from "@/lib/i18n";
import type { ListingTextExportData } from "@/lib/listing-text-import";
import { ListingForm } from "@/components/listing-form";
import { TextImportForm } from "@/components/text-import-form";

export function SellTabs({
  locale,
  t,
  activeTab,
  templateId,
  initialDraftValues,
}: {
  locale: Locale;
  t: Dictionary;
  activeTab: "single" | "import";
  templateId?: string;
  initialDraftValues?: Partial<ListingTextExportData>;
}) {
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
  const singleHref = templateId
    ? `/sell?template=${encodeURIComponent(templateId)}&lang=${locale}`
    : `/sell?lang=${locale}`;
  const importHref = `/sell?tab=import&lang=${locale}`;

  return (
    <div className="grid gap-5">
      <div className="glass-chip grid w-full grid-cols-2 rounded-full p-1 text-sm font-black text-slate-600 sm:w-fit">
        <a
          href={singleHref}
          className={`inline-flex h-10 items-center justify-center rounded-full px-4 transition ${activeTab === "single" ? "theme-active-pill" : "hover:bg-white/70 hover:text-slate-950"}`}
        >
          {labels.single}
        </a>
        <a
          href={importHref}
          className={`inline-flex h-10 items-center justify-center rounded-full px-4 transition ${activeTab === "import" ? "theme-active-pill" : "hover:bg-white/70 hover:text-slate-950"}`}
        >
          {labels.import}
        </a>
      </div>

      {activeTab === "single" ? (
        <ListingForm mode="create" locale={locale} t={t} initialDraftValues={initialDraftValues} />
      ) : (
        <TextImportForm locale={locale} />
      )}
    </div>
  );
}
