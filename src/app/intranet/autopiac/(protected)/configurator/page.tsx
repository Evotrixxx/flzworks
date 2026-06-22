import { Metadata } from "next";
import { dictionaries } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { Header } from "@/components/header";
import { ConfiguratorClient } from "./components/configurator-client";

export const metadata: Metadata = {
  title: "AutoPiac | 3D Configurator",
  description: "Configure your car in immersive 3D.",
};

export default async function ConfiguratorPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const locale = await getLocale(params);
  const t = dictionaries[locale];

  return (
    <>
      <Header locale={locale} />
      <main className="flex-1 w-full relative bg-[#0a0a0c] overflow-hidden">
        <ConfiguratorClient />
      </main>
    </>
  );
}
