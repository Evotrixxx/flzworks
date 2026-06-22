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

  return (
    <header className="autopiac-topbar">
      <div className="mx-auto flex h-full items-center justify-between px-5 gap-4">
        {/* Brand text */}
        <Link
          href={autopiacPath()}
          className="shrink-0 text-sm font-black tracking-widest text-white/90 uppercase hover:text-white transition"
        >
          Autopiac
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-zinc-300 flex-1 justify-center">
          <Link href={autopiacPath("/sell")} className="autopiac-nav-link text-[0.82rem]">
            Hírdetés
          </Link>
          <Link href={autopiacPath()} className="autopiac-nav-link text-[0.82rem]">
            Keresők
          </Link>
          <Link href={autopiacPath("/preferences")} className="autopiac-nav-link text-[0.82rem]">
            Preferenciák
          </Link>
          <Link
            href={autopiacPath("/financing")}
            className="autopiac-nav-link autopiac-nav-link--featured text-[0.82rem] font-black"
          >
            Finanszírozás
          </Link>
          <Link href={autopiacPath("/magazine")} className="autopiac-nav-link text-[0.82rem]">
            Magazin
          </Link>
          <Link href={autopiacPath("/info")} className="autopiac-nav-link text-[0.82rem]">
            Információk
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex shrink-0 items-center gap-2">
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
                className="liquid-button-primary inline-flex h-8 items-center justify-center rounded-full px-4 text-xs font-bold text-white transition"
              >
                Belépés
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white" aria-label="Menu">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
