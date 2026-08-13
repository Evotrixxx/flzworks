-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PortfolioArticle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "folderName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT NOT NULL DEFAULT 'CAR_DESIGN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PortfolioArticle" ("createdAt", "date", "description", "folderName", "id", "title", "updatedAt", "visible") SELECT "createdAt", "date", "description", "folderName", "id", "title", "updatedAt", "visible" FROM "PortfolioArticle";
DROP TABLE "PortfolioArticle";
ALTER TABLE "new_PortfolioArticle" RENAME TO "PortfolioArticle";
CREATE UNIQUE INDEX "PortfolioArticle_folderName_key" ON "PortfolioArticle"("folderName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
