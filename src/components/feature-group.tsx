"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";

export function FeatureGroup({
  title,
  items,
  showMoreLabel,
  showLessLabel,
  initialVisible = 16,
}: {
  title: string;
  items: string[];
  showMoreLabel: string;
  showLessLabel: string;
  initialVisible?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, initialVisible);
  const hiddenCount = Math.max(0, items.length - visibleItems.length);

  return (
    <div>
      <h3 className="text-sm font-black text-slate-800">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {visibleItems.map((item) => (
          <span
            key={item}
            className="glass-chip inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-slate-700"
          >
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
            {item}
          </span>
        ))}
      </div>
      {items.length > initialVisible && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="liquid-button-secondary mt-3 inline-flex h-9 items-center rounded-full px-3 text-xs font-black text-slate-700 transition hover:text-cyan-800"
        >
          {expanded ? showLessLabel : `${showMoreLabel} (${hiddenCount})`}
        </button>
      )}
    </div>
  );
}
