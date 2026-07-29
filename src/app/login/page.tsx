import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n-server";
import type { SearchParamsInput } from "@/lib/listings";
import { GoogleSignInButton } from "@/components/auth-form";
import { Header } from "@/components/header";
import { checkIsAdminEmail } from "@/lib/flz-security";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParamsInput> }) {
  const params = await searchParams;
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale(params)]);

  if (user) {
    const target = user.role === "ADMIN" || checkIsAdminEmail(user.email) ? "/studio" : "/";
    redirect(`${target}?lang=${locale}`);
  }

  return (
    <>
      <Header locale={locale} />
      <div className="mx-auto grid min-h-[calc(100vh-160px)] max-w-md content-center px-4 py-10 sm:px-6">
        <div className="mb-5 text-center">
          <h1 className="text-2xl font-black text-slate-950">Bejelentkezés</h1>
        </div>
        <div className="glass-panel flex justify-center rounded-lg p-6">
          <GoogleSignInButton redirectTo="/studio" locale={locale} />
        </div>
      </div>
    </>
  );
}
