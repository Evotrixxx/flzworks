"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton({ label, compact = false }: { label: string; compact?: boolean }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className={`liquid-button-secondary inline-flex h-9 items-center justify-center gap-2 rounded-full text-sm font-semibold text-slate-700 transition hover:text-rose-700 ${
        compact ? "w-9 px-0" : "px-3"
      }`}
      aria-label={label}
      title={label}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {!compact && <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}
