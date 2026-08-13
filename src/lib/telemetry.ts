import { prisma } from "@/lib/prisma";

export type TelemetrySite = "main" | "autosalon";
export type TelemetryEventType = "social_open" | "vcard_view" | "vcard_download";
export type TelemetryRangeKey = "24h" | "30d" | "1y";

export interface TelemetryRangeSnapshot {
  visits: number;
  averageVisitSeconds: number;
  socialOpens: number;
  vcardViews: Record<TelemetrySite, number>;
}

export interface TelemetrySnapshot {
  generatedAt: string;
  liveVisitors: number;
  ranges: Record<TelemetryRangeKey, TelemetryRangeSnapshot>;
}

export function emptyTelemetrySnapshot(): TelemetrySnapshot {
  return {
    generatedAt: new Date().toISOString(),
    liveVisitors: 0,
    ranges: {
      "24h": { visits: 0, averageVisitSeconds: 0, socialOpens: 0, vcardViews: { main: 0, autosalon: 0 } },
      "30d": { visits: 0, averageVisitSeconds: 0, socialOpens: 0, vcardViews: { main: 0, autosalon: 0 } },
      "1y": { visits: 0, averageVisitSeconds: 0, socialOpens: 0, vcardViews: { main: 0, autosalon: 0 } },
    },
  };
}

export async function deleteExpiredTelemetry(now = new Date()): Promise<void> {
  const cutoff = new Date(now.getTime() - 370 * 24 * 60 * 60 * 1000);
  await prisma.telemetrySession.deleteMany({ where: { startedAt: { lt: cutoff } } });
}

export async function getTelemetrySnapshot(now = new Date()): Promise<TelemetrySnapshot> {
  const liveSince = new Date(now.getTime() - 60 * 1000);
  const eventWindow = (type: TelemetryEventType, site?: TelemetrySite, since?: Date) => ({
    type,
    ...(site ? { site } : {}),
    ...(since ? { occurredAt: { gte: since } } : {}),
  });

  const rangeStarts: Record<TelemetryRangeKey, Date> = {
    "24h": new Date(now.getTime() - 24 * 60 * 60 * 1000),
    "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    "1y": new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
  };
  const liveVisitors = await prisma.telemetrySession.count({
    where: { lastSeenAt: { gte: liveSince }, endedAt: null },
  });
  const rangeEntries = await Promise.all(
    (Object.entries(rangeStarts) as Array<[TelemetryRangeKey, Date]>).map(async ([key, since]) => {
      const [visits, averageDuration, socialOpens, vcardMain, vcardAutosalon] = await Promise.all([
        prisma.telemetrySession.count({ where: { startedAt: { gte: since } } }),
        prisma.telemetrySession.aggregate({
          where: { startedAt: { gte: since } },
          _avg: { durationMs: true },
        }),
        prisma.telemetryEvent.count({ where: eventWindow("social_open", undefined, since) }),
        prisma.telemetryEvent.count({ where: eventWindow("vcard_view", "main", since) }),
        prisma.telemetryEvent.count({ where: eventWindow("vcard_view", "autosalon", since) }),
      ]);
      return [key, {
        visits,
        averageVisitSeconds: Math.round((averageDuration._avg.durationMs ?? 0) / 1000),
        socialOpens,
        vcardViews: { main: vcardMain, autosalon: vcardAutosalon },
      }] as const;
    }),
  );

  return {
    generatedAt: now.toISOString(),
    liveVisitors,
    ranges: Object.fromEntries(rangeEntries) as TelemetrySnapshot["ranges"],
  };
}
