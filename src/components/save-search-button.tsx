"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookmarkPlus, Check } from "lucide-react";

export function SaveSearchButton({
  isAuthenticated,
  label,
}: {
  isAuthenticated: boolean;
  label: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function saveSearch() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    params.delete("lang");
    const query = params.toString();
    const name = params.get("keyword") || params.get("make") || label;

    setPending(true);
    const response = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, query }),
    });

    if (response.ok) {
      setSaved(true);
      router.refresh();
    }

    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={saveSearch}
      disabled={pending || saved}
      className="liquid-button-secondary inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-slate-700 transition hover:text-cyan-800 disabled:opacity-70"
    >
      {saved ? <Check className="h-4 w-4" aria-hidden="true" /> : <BookmarkPlus className="h-4 w-4" aria-hidden="true" />}
      {saved ? "OK" : label}
    </button>
  );
}
