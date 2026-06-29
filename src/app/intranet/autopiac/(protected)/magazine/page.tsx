import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n-server";
import { dictionaries } from "@/lib/i18n";
import type { SearchParamsInput } from "@/lib/listings";
import { Header } from "@/components/header";
import { syncPortfolioArticles } from "@/lib/portfolio-sync";
import { MagazineList } from "@/components/magazine-list";

export const dynamic = "force-dynamic";

interface MagazinePageProps {
  searchParams: Promise<SearchParamsInput>;
}

export default async function MagazinePage({ searchParams }: MagazinePageProps) {
  const params = await searchParams;
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale(params)]);
  
  const t = dictionaries[locale];
  
  // Load and sync portfolio articles from Media/Portfolio
  const allArticles = await syncPortfolioArticles();
  
  // Filter out invisible articles for non-admin users
  const isAdmin = user?.role === "ADMIN";
  const filteredArticles = isAdmin 
    ? allArticles 
    : allArticles.filter((article) => article.visible);

  return (
    <>
      <Header locale={locale} />
      
      <main className="mx-auto max-w-4xl px-4 py-8 md:py-16">
        {/* Page Header */}
        <header className="mb-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2.5 mb-2">
            <span className="h-1.5 w-10 rounded-full bg-cyan-500 shadow-md shadow-cyan-500/30" />
            <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
              {locale === "hu" ? "Archívum & Magazin" : "Archive & Magazine"}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-none mb-3">
            {locale === "hu" ? "Autopiac Magazin" : "Autopiac Magazine"}
          </h1>
          
          <p className="text-slate-400 text-sm font-mono max-w-xl">
            {locale === "hu" 
              ? "Exkluzív 3D járműtervezési, modellezési és makett-fejlesztési projektek FLZ műhelyéből." 
              : "Exclusive 3D vehicle design, modeling, and mock-up development projects from the FLZ workshop."
            }
          </p>
        </header>

        {/* Sync & Interactive list */}
        <MagazineList 
          initialArticles={filteredArticles} 
          user={user} 
          locale={locale} 
        />
      </main>
    </>
  );
}
