import Link from "next/link";
import { Menu } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { dictionaries, type Locale } from "@/lib/i18n";
import { LogoutButton } from "@/components/logout-button";
import { SiteSettings } from "@/components/site-settings";
import { autopiacPath } from "@/lib/routes";

export async function Header({ locale }: { locale: Locale }) {
  const user = await getCurrentUser();
  const t = dictionaries[locale];
  const navItems = [
    { href: autopiacPath("/sell"), label: "Hírdetés" },
    { href: autopiacPath(), label: "Keresők" },
    { href: autopiacPath("/preferences"), label: "Preferenciák" },
    { href: autopiacPath("/financing"), label: "Finanszírozás", featured: true },
    { href: autopiacPath("/magazine"), label: "Magazin" },
    { href: autopiacPath("/info"), label: "Információk" },
  ];

  return (
    <header className="autopiac-topbar">
      <div className="mx-auto flex h-full items-center justify-between gap-4 px-5 sm:px-6">
        <Link
          href={autopiacPath()}
          className="shrink-0 text-base font-black tracking-wide text-slate-950"
        >
          Autopiac
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 text-sm font-black text-slate-600 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={item.featured ? "autopiac-nav-link autopiac-nav-link--featured" : "autopiac-nav-link"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <SiteSettings
            locale={locale}
            labels={{ hu: t.common.hu, en: t.common.en, language: t.common.language }}
          />
          <div className="hidden sm:flex items-center">
            {user ? (
              <LogoutButton label={t.nav.logout} compact />
            ) : (
              <Link
                href="/login"
                className="liquid-button-primary inline-flex h-9 items-center justify-center rounded-full px-4 text-xs font-black text-white transition"
              >
                Belépés
              </Link>
            )}
          </div>

          <button className="liquid-button-secondary inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-700 lg:hidden" aria-label="Menu">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
