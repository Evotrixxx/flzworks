"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Languages } from "lucide-react";
import { locales, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Record<Locale, string> & { language: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  async function switchTo(nextLocale: Locale) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLocale);
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });
    router.push(`${pathname}?${params.toString()}`);
    router.refresh();
  }

  return (
    <div className="glass-chip inline-flex h-9 items-center rounded-full p-1 text-xs font-semibold text-slate-600">
      <Languages className="ml-1 mr-1 h-4 w-4 text-[var(--accent-aqua)]" aria-hidden="true" />
      <span className="sr-only">{labels.language}</span>
      {locales.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => switchTo(item)}
          className={`h-7 rounded-full px-2 transition ${
            locale === item ? "theme-active-pill" : "hover:bg-white/70"
          }`}
        >
          {labels[item]}
        </button>
      ))}
    </div>
  );
}
