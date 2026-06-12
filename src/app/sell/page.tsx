import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { dictionaries } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import type { SearchParamsInput } from "@/lib/listings";
import { ListingForm } from "@/components/listing-form";
import { Header } from "@/components/header";

export const dynamic = "force-dynamic";

export default async function SellPage({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const params = await searchParams;
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale(params)]);

  if (!user) {
    redirect(`/login?redirect=/sell&lang=${locale}`);
  }

  const t = dictionaries[locale];

  return (
    <>
      <Header locale={locale} />
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5">
          <h1 className="text-2xl font-black text-slate-950">{t.forms.listingTitle}</h1>
        </div>
        <ListingForm mode="create" locale={locale} t={t} />
      </div>
    </>
  );
}
