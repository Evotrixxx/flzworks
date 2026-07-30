-- FlzProject / FlzSetting reached schema.prisma without a migration, so
-- `prisma migrate deploy` never created them in production and every studio
-- read of them failed. IF NOT EXISTS keeps this safe on any environment where
-- the tables were already created by `prisma db push`.

-- CreateTable
CREATE TABLE IF NOT EXISTS "FlzProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "tools" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "age" TEXT,
    "gradient" TEXT,
    "description" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "linkUrl" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "FlzSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FlzProject_visible_sortOrder_idx" ON "FlzProject"("visible", "sortOrder");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "FlzProject_category_idx" ON "FlzProject"("category");
