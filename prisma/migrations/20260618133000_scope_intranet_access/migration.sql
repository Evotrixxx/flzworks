ALTER TABLE "IntranetAccessRequest" ADD COLUMN "module" TEXT NOT NULL DEFAULT 'autopiac';

DROP INDEX "IntranetAccessRequest_ipAddress_status_expiresAt_idx";
CREATE INDEX "IntranetAccessRequest_module_ipAddress_status_expiresAt_idx" ON "IntranetAccessRequest"("module", "ipAddress", "status", "expiresAt");
