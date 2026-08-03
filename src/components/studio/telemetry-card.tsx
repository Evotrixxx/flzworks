"use client";

import { useEffect, useState } from "react";
import { Activity, Clock3, ContactRound, MousePointerClick } from "lucide-react";
import type { TelemetrySnapshot } from "@/lib/telemetry";
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
  total,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  total?: number;
}) {
  return (
    <div className={s.telemetryRow}>
      <span className={s.telemetryIcon}>{icon}</span>
      <span className={s.telemetryLabel}>{label}</span>
      <span className={s.telemetryValue}>{value}</span>
      {total !== undefined && <span className={s.telemetryTotal}>{total} total</span>}
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

  return (
    <section className={s.telemetry} aria-label="Live site telemetry">
      <div className={s.telemetryHead}>
        <span className={s.telemetryTitle}>Live telemetry</span>
      </div>
      <div className={s.telemetryHero}>
        <span className={s.telemetryHeroValue}>{data.liveVisitors}</span>
        <span className={s.telemetryHeroLabel}>on site now</span>
      </div>
      <div className={s.telemetryRows}>
        <MetricRow icon={<Activity size={13} />} label="Visits (24h)" value={data.visits24h} />
        <MetricRow icon={<Clock3 size={13} />} label="Avg. visit (24h)" value={formatDuration(data.averageVisitSeconds24h)} />
        <MetricRow icon={<MousePointerClick size={13} />} label="Social opens (24h)" value={data.socialOpens24h} total={data.socialOpensTotal} />
        <MetricRow icon={<ContactRound size={13} />} label="vCard main" value={data.vcardViews24h.main} total={data.vcardViewsTotal.main} />
        <MetricRow icon={<ContactRound size={13} />} label="vCard salon" value={data.vcardViews24h.autosalon} total={data.vcardViewsTotal.autosalon} />
      </div>
    </section>
  );
}
