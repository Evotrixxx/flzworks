-- Preserve Studio deletions across future social imports. A provider identity
-- recorded here must never be recreated by an automatic or manual sync.
CREATE TABLE IF NOT EXISTS "FlzSocialProjectTombstone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "socialPlatform" TEXT NOT NULL,
    "socialPostId" TEXT NOT NULL,
    "deletedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "FlzSocialProjectTombstone_socialPlatform_socialPostId_key"
ON "FlzSocialProjectTombstone"("socialPlatform", "socialPostId");

CREATE INDEX IF NOT EXISTS "FlzSocialProjectTombstone_socialPlatform_idx"
ON "FlzSocialProjectTombstone"("socialPlatform");
