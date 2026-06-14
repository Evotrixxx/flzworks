import Link from "next/link";
import { Bookmark, Car, Gauge, Heart, PlusCircle, Search, UserCircle, UserPlus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { dictionaries, type Locale } from "@/lib/i18n";
import { LogoutButton } from "@/components/logout-button";
import { SiteSettings } from "@/components/site-settings";

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
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-2 text-lg font-black text-slate-950"
          aria-label={t.brand}
          title={t.brand}
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 text-white shadow-[0_10px_24px_rgba(0,119,130,0.22)]"
            style={{ background: "var(--liquid-primary)" }}
          >
            <Car className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">{t.brand}</span>
        </Link>

        <nav className="glass-chip scrollbar-none flex min-w-0 flex-1 justify-center gap-1 overflow-x-auto rounded-full p-1 text-sm font-semibold text-slate-600">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-white/70 hover:text-slate-950 sm:w-10"
              aria-label={item.label}
              title={item.label}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <SiteSettings
            locale={locale}
            labels={{ hu: t.common.hu, en: t.common.en, language: t.common.language }}
          />
            {user ? (
              <>
                <Link
                  href="/saved-searches"
                  className="liquid-button-secondary inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-slate-700 transition hover:text-[var(--accent-aqua)]"
                  aria-label={t.nav.savedSearches}
                  title={t.nav.savedSearches}
                >
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                </Link>
                <LogoutButton label={t.nav.logout} compact />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="liquid-button-secondary inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-slate-700 transition hover:text-[var(--accent-aqua)]"
                  aria-label={t.nav.login}
                  title={t.nav.login}
                >
                  <UserCircle className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/register"
                  className="liquid-button-primary hidden h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white transition sm:inline-flex"
                  aria-label={t.nav.register}
                  title={t.nav.register}
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            )}
        </div>
      </div>
    </header>
  );
}
