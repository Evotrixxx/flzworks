-- Track the provider identity of imported social posts so repeated syncs update
-- the existing project instead of creating duplicates.
ALTER TABLE "FlzProject" ADD COLUMN "socialPlatform" TEXT;
ALTER TABLE "FlzProject" ADD COLUMN "socialPostId" TEXT;

CREATE UNIQUE INDEX "FlzProject_socialPlatform_socialPostId_key"
ON "FlzProject"("socialPlatform", "socialPostId");
