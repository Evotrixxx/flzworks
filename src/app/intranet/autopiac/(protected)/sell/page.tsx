import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { dictionaries } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { listingToTemplateValues } from "@/lib/listing-template";
import type { SearchParamsInput } from "@/lib/listings";
import type { ListingTextExportData } from "@/lib/listing-text-import";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/header";
import { SellTabs } from "@/components/sell-tabs";
import { autopiacPath } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function SellPage({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const params = await searchParams;
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale(params)]);

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(autopiacPath("/sell"))}&lang=${locale}`);
  }

  const t = dictionaries[locale];
  const templateId = Array.isArray(params.template) ? params.template[0] : params.template;
  const activeTab = params.tab === "import" ? "import" : "single";
  let initialDraftValues: Partial<ListingTextExportData> | undefined;

  if (activeTab === "single" && templateId) {
    const template = await prisma.listing.findFirst({
      where: { id: templateId, sellerId: user.id },
    });

    if (template) {
      initialDraftValues = {
        ...(listingToTemplateValues(template) as Partial<ListingTextExportData>),
        status: "PUBLISHED",
      };
    }
  }

  return (
    <>
      <Header locale={locale} />
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5">
          <h1 className="text-2xl font-black text-slate-950">{t.forms.listingTitle}</h1>
        </div>
        <SellTabs
          locale={locale}
          t={t}
          activeTab={activeTab}
          templateId={activeTab === "single" ? templateId : undefined}
          initialDraftValues={initialDraftValues}
        />
      </div>
    </>
  );
}
