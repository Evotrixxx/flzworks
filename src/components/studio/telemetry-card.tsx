"use client";

import { useEffect, useState } from "react";
import { Activity, Clock3, ContactRound, MousePointerClick } from "lucide-react";
import type { TelemetryRangeKey, TelemetrySnapshot } from "@/lib/telemetry";
import s from "@/components/studio/studio.module.css";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes < 60) return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function MetricRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className={s.telemetryRow}>
      <span className={s.telemetryIcon}>{icon}</span>
      <span className={s.telemetryLabel}>{label}</span>
      <span className={s.telemetryValue}>{value}</span>
    </div>
  );
}

export function TelemetryCard({
  initial,
  live = true,
}: {
  initial: TelemetrySnapshot;
  live?: boolean;
}) {
  const [data, setData] = useState(initial);
  const [range, setRange] = useState<TelemetryRangeKey>("24h");

  useEffect(() => {
    if (!live) return;
    let cancelled = false;

    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const response = await fetch("/api/flz/telemetry", { cache: "no-store" });
        if (!response.ok) throw new Error("Telemetry request failed");
        const body = await response.json() as { telemetry?: TelemetrySnapshot };
        if (!cancelled && body.telemetry) {
          setData(body.telemetry);
        }
      } catch {
        // Keep the latest snapshot visible until the next refresh succeeds.
      }
    };

    void refresh();
    const interval = window.setInterval(refresh, 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [live]);

  const scoped = data.ranges[range];
  const rangeLabel = range === "24h" ? "24h" : range === "30d" ? "1mo" : "1yr";

  return (
    <section className={s.telemetry} aria-label="Live site telemetry">
      <div className={s.telemetryHead}>
        <span className={s.telemetryTitle}>Live telemetry</span>
      </div>
      <div className={s.telemetryScope} aria-label="Telemetry period">
        {(["24h", "30d", "1y"] as TelemetryRangeKey[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={range === option}
            className={range === option ? s.telemetryScopeActive : ""}
            onClick={() => setRange(option)}
          >
            {option === "24h" ? "24h" : option === "30d" ? "1mo" : "1yr"}
          </button>
        ))}
      </div>
      <div className={s.telemetryHero}>
        <span className={s.telemetryHeroValue}>{data.liveVisitors}</span>
        <span className={s.telemetryHeroLabel}>on site now</span>
      </div>
      <div className={s.telemetryRows}>
        <MetricRow icon={<Activity size={13} />} label={`Visits (${rangeLabel})`} value={scoped.visits} />
        <MetricRow icon={<Clock3 size={13} />} label={`Avg. visit (${rangeLabel})`} value={formatDuration(scoped.averageVisitSeconds)} />
        <MetricRow icon={<MousePointerClick size={13} />} label={`Social opens (${rangeLabel})`} value={scoped.socialOpens} />
        <MetricRow icon={<ContactRound size={13} />} label="vCard main" value={scoped.vcardViews.main} />
        <MetricRow icon={<ContactRound size={13} />} label="vCard salon" value={scoped.vcardViews.autosalon} />
      </div>
    </section>
  );
}
