import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { dictionaries } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import type { SearchParamsInput } from "@/lib/listings";
import { AuthForm } from "@/components/auth-form";
import { Header } from "@/components/header";
import { autopiacPath } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const params = await searchParams;
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale(params)]);

  if (user) {
    redirect(`${autopiacPath("/dashboard")}?lang=${locale}`);
  }

  const t = dictionaries[locale];

  return (
    <>
      <Header locale={locale} />
      <div className="mx-auto grid min-h-[calc(100vh-160px)] max-w-md content-center px-4 py-10 sm:px-6">
        <div className="mb-5">
          <h1 className="text-2xl font-black text-slate-950">{t.auth.loginTitle}</h1>
          <Link href={`/register?lang=${locale}`} className="mt-2 inline-flex text-sm font-black text-cyan-800">
            {t.nav.register}
          </Link>
        </div>
        <AuthForm mode="login" t={t} locale={locale} />
      </div>
    </>
  );
}
