"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function SavedSearchActions({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    setPending(true);
    const response = await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });

    if (response.ok) {
      router.refresh();
    }

    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={pending}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-rose-200/70 bg-rose-50/70 px-3 text-sm font-semibold text-rose-700 shadow-sm backdrop-blur transition hover:bg-rose-100 disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}
