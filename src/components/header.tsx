import Link from "next/link";
import { Car, Gauge, Heart, PlusCircle, Search, UserCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { dictionaries, type Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LogoutButton } from "@/components/logout-button";

export async function Header({ locale }: { locale: Locale }) {
  const user = await getCurrentUser();
  const t = dictionaries[locale];

  const navItems = [
    { href: "/", label: t.nav.search, icon: Search },
    { href: "/sell", label: t.nav.sell, icon: PlusCircle },
    { href: "/dashboard", label: t.nav.dashboard, icon: Gauge },
    { href: "/favorites", label: t.nav.favorites, icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/45 shadow-[0_12px_34px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-gradient-to-br from-cyan-500 via-emerald-500 to-slate-900 text-white shadow-[0_10px_24px_rgba(0,119,130,0.22)]">
              <Car className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>{t.brand}</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher
              locale={locale}
              labels={{ hu: t.common.hu, en: t.common.en, language: t.common.language }}
            />
            {user ? (
              <>
                <Link
                  href="/saved-searches"
                  className="liquid-button-secondary hidden h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-700 transition hover:text-cyan-800 sm:inline-flex"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  {t.nav.savedSearches}
                </Link>
                <LogoutButton label={t.nav.logout} />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="liquid-button-secondary inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-700 transition hover:text-cyan-800"
                >
                  <UserCircle className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{t.nav.login}</span>
                </Link>
                <Link
                  href="/register"
                  className="liquid-button-primary hidden h-9 items-center rounded-full px-3 text-sm font-semibold text-white transition sm:inline-flex"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>
        </div>

        <nav className="glass-chip scrollbar-none flex gap-1 overflow-x-auto rounded-full p-1 text-sm font-semibold text-slate-600">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3 transition hover:bg-white/70 hover:text-slate-950"
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
