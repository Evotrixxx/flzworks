"use client";

import { type ReactNode, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export function MobileFilters({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="liquid-button-primary inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="glass-panel absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-lg p-4 shadow-2xl">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="liquid-button-secondary inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
