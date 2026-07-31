-- FlzProject: article text + a real publication date.
--
-- `description` becomes `body` (the article text) and keeps its content.
-- `age` held hand-typed labels like "2 weeks ago"; it is replaced by a real
-- `publishedAt` date that the site renders as days/months/years ago. Existing
-- rows fall back to their creation date because the old labels cannot be parsed.

ALTER TABLE "FlzProject" RENAME COLUMN "description" TO "body";
ALTER TABLE "FlzProject" DROP COLUMN "age";
ALTER TABLE "FlzProject" ADD COLUMN "publishedAt" DATETIME;

UPDATE "FlzProject" SET "publishedAt" = "createdAt" WHERE "publishedAt" IS NULL;
