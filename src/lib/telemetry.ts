import { prisma } from "@/lib/prisma";

export type TelemetrySite = "main" | "autosalon";
export type TelemetryEventType = "social_open" | "vcard_view" | "vcard_download";

export interface TelemetrySnapshot {
  generatedAt: string;
  liveVisitors: number;
  visits24h: number;
  averageVisitSeconds24h: number;
  socialOpens24h: number;
  socialOpensTotal: number;
  vcardViews24h: Record<TelemetrySite, number>;
  vcardViewsTotal: Record<TelemetrySite, number>;
}

export function emptyTelemetrySnapshot(): TelemetrySnapshot {
  return {
    generatedAt: new Date().toISOString(),
    liveVisitors: 0,
    visits24h: 0,
    averageVisitSeconds24h: 0,
    socialOpens24h: 0,
    socialOpensTotal: 0,
    vcardViews24h: { main: 0, autosalon: 0 },
    vcardViewsTotal: { main: 0, autosalon: 0 },
  };
}

export async function deleteExpiredTelemetry(now = new Date()): Promise<void> {
  const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  await prisma.telemetrySession.deleteMany({ where: { startedAt: { lt: cutoff } } });
}

export async function getTelemetrySnapshot(now = new Date()): Promise<TelemetrySnapshot> {
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const liveSince = new Date(now.getTime() - 60 * 1000);
  const eventWindow = (type: TelemetryEventType, site?: TelemetrySite, since?: Date) => ({
    type,
    ...(site ? { site } : {}),
    ...(since ? { occurredAt: { gte: since } } : {}),
  });

  const [
    liveVisitors,
    visits24h,
    averageDuration,
    socialOpens24h,
    socialOpensTotal,
    vcardMain24h,
    vcardAutosalon24h,
    vcardMainTotal,
    vcardAutosalonTotal,
  ] = await Promise.all([
    prisma.telemetrySession.count({
      where: { lastSeenAt: { gte: liveSince }, endedAt: null },
    }),
    prisma.telemetrySession.count({ where: { startedAt: { gte: since24h } } }),
    prisma.telemetrySession.aggregate({
      where: { startedAt: { gte: since24h } },
      _avg: { durationMs: true },
    }),
    prisma.telemetryEvent.count({ where: eventWindow("social_open", undefined, since24h) }),
    prisma.telemetryEvent.count({ where: eventWindow("social_open") }),
    prisma.telemetryEvent.count({ where: eventWindow("vcard_view", "main", since24h) }),
    prisma.telemetryEvent.count({ where: eventWindow("vcard_view", "autosalon", since24h) }),
    prisma.telemetryEvent.count({ where: eventWindow("vcard_view", "main") }),
    prisma.telemetryEvent.count({ where: eventWindow("vcard_view", "autosalon") }),
  ]);

  return {
    generatedAt: now.toISOString(),
    liveVisitors,
    visits24h,
    averageVisitSeconds24h: Math.round((averageDuration._avg.durationMs ?? 0) / 1000),
    socialOpens24h,
    socialOpensTotal,
    vcardViews24h: { main: vcardMain24h, autosalon: vcardAutosalon24h },
    vcardViewsTotal: { main: vcardMainTotal, autosalon: vcardAutosalonTotal },
  };
}
