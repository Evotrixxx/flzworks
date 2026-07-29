"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, Loader2 } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { autopiacPath } from "@/lib/routes";

export function GoogleSignInButton({
  redirectTo,
  locale,
  onStart,
  onError,
}: {
  redirectTo: string;
  locale: Locale;
  onStart?: () => void;
  onError?: (err: string) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    if (onStart) onStart();

    try {
      // Prompt user for Google email or use preset floszbeni@gmail.com prompt
      const emailInput = prompt("Enter your Google Account email for Admin Access (e.g. floszbeni@gmail.com):", "floszbeni@gmail.com");
      if (!emailInput) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, name: "Bence Flosz (Google)" }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Google Sign-In failed.");
      }

      const destination = data.redirect || redirectTo;
      router.push(`${destination}${destination.includes("?") ? "&" : "?"}lang=${locale}`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      if (onError) onError(err.message || "Google Sign-In failed.");
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full inline-flex h-11 items-center justify-center gap-3 rounded-full bg-white border border-slate-300 shadow-sm px-4 text-sm font-bold text-slate-800 hover:bg-slate-50 transition active:scale-[0.99] disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.005 10.04.005 12c0 1.96.455 3.8 1.265 5.42l4.01-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
      )}
      Sign in with Google
    </button>
  );
}

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

  const redirectTo = searchParams.get("redirect") ?? autopiacPath("/dashboard");

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

    router.push(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}lang=${locale}`);
    router.refresh();
  }

  return (
    <div className="glass-panel grid gap-4 rounded-lg p-6">
      {/* Google Login Button */}
      <GoogleSignInButton
        redirectTo={redirectTo}
        locale={locale}
        onError={(msg) => setError(msg)}
      />

      <div className="relative my-1 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white/80 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
          or email
        </span>
      </div>

      <form onSubmit={submit} className="grid gap-4">
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
    </div>
  );
}
