"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, User, Loader2 } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

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
  const buttonRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const initializedRef = useRef(false);

  const handleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      setLoading(true);
      if (onStart) onStart();

      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Google Sign-In failed.");
        }

        const destination = data.redirect || "/studio";
        router.push(`${destination}${destination.includes("?") ? "&" : "?"}lang=${locale}`);
        router.refresh();
      } catch (err: any) {
        console.error(err);
        if (onError) onError(err.message || "Google Sign-In failed.");
        setLoading(false);
      }
    },
    [router, locale, onStart, onError],
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !buttonRef.current || initializedRef.current) return;

    function tryInit() {
      if (typeof google === "undefined" || !google?.accounts?.id) return false;
      if (initializedRef.current) return true;

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
      });

      google.accounts.id.renderButton(buttonRef.current!, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "pill",
        width: 320,
      });

      initializedRef.current = true;
      return true;
    }

    if (!tryInit()) {
      const interval = setInterval(() => {
        if (tryInit()) clearInterval(interval);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [handleCredentialResponse]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={buttonRef} className="min-h-[44px]" />
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing in...
        </div>
      )}
    </div>
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

  const redirectTo = searchParams.get("redirect") ?? "/studio";

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
      const data = await response.json().catch(() => null);
      setError(data?.error || t.forms.error);
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
