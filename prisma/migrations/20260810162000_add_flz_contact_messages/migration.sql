CREATE TABLE "FlzContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'portfolio',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE INDEX "FlzContactMessage_status_createdAt_idx"
ON "FlzContactMessage"("status", "createdAt");

CREATE INDEX "FlzContactMessage_createdAt_idx"
ON "FlzContactMessage"("createdAt");
