"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { autopiacPath } from "@/lib/routes";

export function AuthForm({
  mode,
  t,
  locale,
}: {
  mode: "login" | "register";
  t: Dictionary;
  locale: Locale;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });

    if (!response.ok) {
      setError(t.forms.error);
      setPending(false);
      return;
    }

    const redirectTo = searchParams.get("redirect") ?? autopiacPath("/dashboard");
    router.push(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}lang=${locale}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="glass-panel grid gap-4 rounded-lg p-6">
      {mode === "register" && (
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {t.forms.name}
          <span className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              name="name"
              required
              className="h-11 w-full pl-10 pr-3 font-normal outline-none transition"
            />
          </span>
        </label>
      )}

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        {t.forms.email}
        <span className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            name="email"
            type="email"
            required
            className="h-11 w-full pl-10 pr-3 font-normal outline-none transition"
          />
        </span>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        {t.forms.password}
        <span className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="h-11 w-full pl-10 pr-3 font-normal outline-none transition"
          />
        </span>
      </label>

      {error && <p className="rounded-lg bg-rose-50/80 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="liquid-button-primary inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-black text-white transition disabled:opacity-60"
      >
        {mode === "login" ? t.auth.loginCta : t.auth.registerCta}
      </button>

      <p className="text-sm font-semibold text-slate-500">{t.auth.demo}</p>
    </form>
  );
}
