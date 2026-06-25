import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n-server";
import { dictionaries } from "@/lib/i18n";
import type { SearchParamsInput } from "@/lib/listings";
import { Header } from "@/components/header";
import { syncPortfolioArticles } from "@/lib/portfolio-sync";
import { MagazineAdmin } from "@/components/magazine-admin";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { autopiacPath } from "@/lib/routes";

export const dynamic = "force-dynamic";

interface AdminPageProps {
  searchParams: Promise<SearchParamsInput>;
}

export default async function MagazineAdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale(params)]);
  
  const t = dictionaries[locale];

  // Protect route: require user
  if (!user) {
    const nextPath = encodeURIComponent(`${autopiacPath("/magazine/admin")}?lang=${locale}`);
    redirect(`/login?redirect=${nextPath}`);
  }

  // Protect route: require ADMIN role
  if (user.role !== "ADMIN") {
    return (
      <>
        <Header locale={locale} />
        <main className="mx-auto max-w-md px-4 py-20 flex min-h-[calc(100vh-160px)] flex-col justify-center">
          <div className="glass-panel border-rose-500/20 bg-rose-950/5 text-center rounded-2xl p-8 shadow-xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-rose-950/40 text-rose-500 border border-rose-500/20">
              <ShieldAlert className="h-7 w-7" />
            </div>
            
            <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
              Hozzáférés Megtagadva
            </h1>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Az adminisztrátori szerkesztő felület eléréséhez admin jogosultságú fiókkal kell bejelentkezned.
              Jelenleg bejelentkezett fiók: <strong className="text-slate-200">{user.email}</strong>.
            </p>

            <div className="grid gap-3">
              <a
                href={autopiacPath("/magazine")}
                className="liquid-button-secondary inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-black text-white hover:opacity-90 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Vissza a Magazinba
              </a>
              
              <div className="flex justify-center">
                <LogoutButton label="Kijelentkezés és belépés admin fiókkal" compact />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Sync and fetch all articles (visible and hidden)
  const articles = await syncPortfolioArticles();

  return (
    <>
      <Header locale={locale} />
      
      <main className="mx-auto max-w-4xl px-4 py-8 md:py-16">
        {/* Page Header */}
        <header className="mb-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
            <span className="h-1.5 w-10 rounded-full bg-cyan-500 shadow-md shadow-cyan-500/30" />
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
              Adminisztrátori Felület
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-3">
            Magazin Szerkesztése
          </h1>
          
          <p className="text-slate-400 text-sm font-mono max-w-xl">
            Kezeld a Media/Portfolio tárolóból szinkronizált cikkeket. Szerkeszd a címeket, dátumokat, leírásokat és állítsd be a láthatóságot.
          </p>
        </header>

        {/* Interactive Admin panel */}
        <MagazineAdmin 
          initialArticles={articles} 
          locale={locale} 
        />
      </main>
    </>
  );
}
