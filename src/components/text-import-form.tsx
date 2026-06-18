"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ClipboardList, Eye, FilePlus2, Loader2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { listingImportTemplate, type ListingImportPreview } from "@/lib/listing-text-import";
import type { Locale } from "@/lib/i18n";
import { autopiacPath } from "@/lib/routes";

export function TextImportForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [text, setText] = useState(listingImportTemplate);
  const [preview, setPreview] = useState<ListingImportPreview | null>(null);
  const [pending, setPending] = useState<"preview" | "create" | null>(null);
  const [message, setMessage] = useState("");
  const copy =
    locale === "hu"
      ? {
          title: "Hirdetesek importalasa szovegbol",
          help: "Toltsd ki a mintat. A hirdetesek piszkozatkent jonnek letre, kepeket kesobb tudsz feltolteni.",
          preview: "Ellenorzes",
          create: "Piszkozatok letrehozasa",
          upload: "TXT betoltes",
          valid: "ervenyes",
          invalid: "hibas",
          warnings: "Figyelmeztetesek",
          errors: "Hibak",
          created: "Piszkozatok letrehozva.",
          dashboard: "Hirdeteseim",
          empty: "Nincs feldolgozhato hirdetes.",
        }
      : {
          title: "Import listings from text",
          help: "Fill the template. Listings are created as drafts, and photos can be added later.",
          preview: "Preview",
          create: "Create drafts",
          upload: "Load TXT",
          valid: "valid",
          invalid: "invalid",
          warnings: "Warnings",
          errors: "Errors",
          created: "Draft listings created.",
          dashboard: "My listings",
          empty: "No listing text to parse.",
        };

  async function requestImport(action: "preview" | "create") {
    setPending(action);
    setMessage("");

    const response = await fetch("/api/listings/import-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, text, locale }),
    });
    const payload = (await response.json().catch(() => null)) as
      | (ListingImportPreview & { error?: string })
      | { preview?: ListingImportPreview; createdCount?: number; skippedCount?: number; error?: string }
      | null;

    if (!response.ok) {
      setMessage(payload?.error ?? copy.empty);
      if (payload && "preview" in payload && payload.preview) {
        setPreview(payload.preview);
      }
      setPending(null);
      return;
    }

    if (action === "preview") {
      setPreview(payload as ListingImportPreview);
    } else {
      const createdCount = payload && "createdCount" in payload ? payload.createdCount ?? 0 : 0;
      const skippedCount = payload && "skippedCount" in payload ? payload.skippedCount ?? 0 : 0;
      setMessage(`${copy.created} ${createdCount} ${copy.valid}${skippedCount ? `, ${skippedCount} ${copy.invalid}` : ""}.`);
      if (payload && "preview" in payload && payload.preview) {
        setPreview(payload.preview);
      }
      router.refresh();
    }

    setPending(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await requestImport("preview");
  }

  return (
    <form onSubmit={onSubmit} className="glass-panel grid gap-5 rounded-lg p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
            <ClipboardList className="h-5 w-5 text-[var(--accent-aqua)]" aria-hidden="true" />
            {copy.title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">{copy.help}</p>
        </div>
        <Link
          href={`${autopiacPath("/dashboard")}?lang=${locale}`}
          className="liquid-button-secondary inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-black text-slate-700"
        >
          {copy.dashboard}
        </Link>
      </div>

      <label className="liquid-button-secondary inline-flex h-10 w-fit cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-black text-slate-700">
        <UploadCloud className="h-4 w-4" aria-hidden="true" />
        {copy.upload}
        <input
          type="file"
          accept=".txt,text/plain"
          className="sr-only"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setText(await file.text());
            setPreview(null);
            setMessage("");
          }}
        />
      </label>

      <textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setPreview(null);
          setMessage("");
        }}
        rows={22}
        className="min-h-[28rem] px-4 py-3 font-mono text-sm leading-6 outline-none transition"
        spellCheck={false}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={Boolean(pending)}
          className="liquid-button-secondary inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-black text-slate-700 transition disabled:opacity-60"
        >
          {pending === "preview" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
          {copy.preview}
        </button>
        <button
          type="button"
          onClick={() => requestImport("create")}
          disabled={Boolean(pending) || !preview?.validCount}
          className="liquid-button-primary inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-black text-white transition disabled:opacity-60"
        >
          {pending === "create" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FilePlus2 className="h-4 w-4" aria-hidden="true" />}
          {copy.create}
        </button>
      </div>

      {message && <p className="rounded-lg bg-white/70 px-3 py-2 text-sm font-black text-slate-700">{message}</p>}

      {preview && (
        <section className="grid gap-3">
          <div className="flex flex-wrap gap-2 text-xs font-black text-slate-600">
            <span className="glass-chip rounded-full px-3 py-1">{preview.validCount} {copy.valid}</span>
            <span className="glass-chip rounded-full px-3 py-1">{preview.invalidCount} {copy.invalid}</span>
          </div>

          <div className="grid gap-3">
            {preview.items.map((item) => (
              <article key={item.index} className="glass-chip rounded-lg p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      #{item.index} {item.ok ? item.title : item.raw.make || item.raw.model || copy.invalid}
                    </p>
                    <p className={`mt-1 text-xs font-black ${item.ok ? "text-emerald-700" : "text-rose-700"}`}>
                      {item.ok ? copy.valid : copy.invalid}
                    </p>
                  </div>
                </div>

                {item.warnings.length > 0 && (
                  <div className="mt-3 text-xs font-semibold text-amber-800">
                    <p className="font-black">{copy.warnings}</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {item.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!item.ok && (
                  <div className="mt-3 text-xs font-semibold text-rose-700">
                    <p className="font-black">{copy.errors}</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {Object.entries(item.fieldErrors).map(([field, error]) => (
                        <li key={field}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </form>
  );
}
