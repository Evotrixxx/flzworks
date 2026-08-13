CREATE TABLE "IntranetAccessRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approveTokenHash" TEXT NOT NULL,
    "denyTokenHash" TEXT NOT NULL,
    "approvedAt" DATETIME,
    "deniedAt" DATETIME,
    "accessedAt" DATETIME,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "IntranetAccessRequest_approveTokenHash_key" ON "IntranetAccessRequest"("approveTokenHash");
CREATE UNIQUE INDEX "IntranetAccessRequest_denyTokenHash_key" ON "IntranetAccessRequest"("denyTokenHash");
CREATE INDEX "IntranetAccessRequest_ipAddress_status_expiresAt_idx" ON "IntranetAccessRequest"("ipAddress", "status", "expiresAt");
CREATE INDEX "IntranetAccessRequest_email_createdAt_idx" ON "IntranetAccessRequest"("email", "createdAt");

CREATE TABLE "IntranetIpBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ipAddress" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "IntranetIpBlock_ipAddress_expiresAt_idx" ON "IntranetIpBlock"("ipAddress", "expiresAt");
