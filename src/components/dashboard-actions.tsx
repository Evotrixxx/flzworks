"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Download, FilePlus2, PauseCircle, Trash2 } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { autopiacPath } from "@/lib/routes";

export function DashboardActions({
  id,
  status,
  locale,
  labels,
}: {
  id: string;
  status: string;
  locale: Locale;
  labels: {
    publish: string;
    save: string;
    delete: string;
    downloadText: string;
    useTemplate: string;
  };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function updateStatus(nextStatus: string) {
    setPending(true);
    const response = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (response.ok) {
      router.refresh();
    }

    setPending(false);
  }

  async function remove() {
    setPending(true);
    const response = await fetch(`/api/listings/${id}`, { method: "DELETE" });

    if (response.ok) {
      router.refresh();
    }

    setPending(false);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`/api/listings/${id}/export-text?lang=${locale}`}
        className="liquid-button-secondary inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-black text-slate-700 transition hover:text-cyan-800"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        {labels.downloadText}
      </a>
      <Link
        href={`${autopiacPath("/sell")}?template=${id}&lang=${locale}`}
        className="liquid-button-secondary inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-black text-slate-700 transition hover:text-cyan-800"
      >
        <FilePlus2 className="h-4 w-4" aria-hidden="true" />
        {labels.useTemplate}
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => updateStatus(status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}
        className="liquid-button-secondary inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-black text-slate-700 transition hover:text-cyan-800 disabled:opacity-60"
      >
        {status === "PUBLISHED" ? (
          <PauseCircle className="h-4 w-4" aria-hidden="true" />
        ) : (
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
        )}
        {status === "PUBLISHED" ? labels.save : labels.publish}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={remove}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-rose-200/70 bg-rose-50/70 px-3 text-xs font-black text-rose-700 shadow-sm backdrop-blur transition hover:bg-rose-100 disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        {labels.delete}
      </button>
    </div>
  );
}
