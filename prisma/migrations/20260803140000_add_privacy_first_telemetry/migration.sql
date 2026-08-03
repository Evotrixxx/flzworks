-- Consent-based first-party audience measurement. The schema intentionally
-- excludes network addresses, user agents, referrers, account IDs and any
-- cross-site identifier.

-- CreateTable
CREATE TABLE IF NOT EXISTS "TelemetrySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "site" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "durationMs" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TelemetryEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT,
    "dedupeKey" TEXT,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TelemetryEvent_sessionId_fkey"
      FOREIGN KEY ("sessionId") REFERENCES "TelemetrySession" ("id")
      ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TelemetrySession_site_startedAt_idx"
  ON "TelemetrySession"("site", "startedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TelemetrySession_lastSeenAt_idx"
  ON "TelemetrySession"("lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TelemetryEvent_dedupeKey_key"
  ON "TelemetryEvent"("dedupeKey");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TelemetryEvent_site_type_occurredAt_idx"
  ON "TelemetryEvent"("site", "type", "occurredAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TelemetryEvent_sessionId_occurredAt_idx"
  ON "TelemetryEvent"("sessionId", "occurredAt");
