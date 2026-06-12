-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sellerId" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "yearMonth" TEXT,
    "year" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "priceEur" INTEGER,
    "mileage" INTEGER NOT NULL,
    "fuel" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "bodyType" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "financingDetails" TEXT,
    "financeTermMonths" INTEGER,
    "seats" INTEGER,
    "doors" INTEGER,
    "color" TEXT,
    "upholsteryPrimary" TEXT,
    "upholsterySecondary" TEXT,
    "curbWeightKg" INTEGER,
    "grossWeightKg" INTEGER,
    "trunkVolumeLiters" INTEGER,
    "climate" TEXT,
    "roof" TEXT,
    "engineDisplacementCcm" INTEGER,
    "powerKw" INTEGER,
    "powerHp" INTEGER,
    "cylinderLayout" TEXT,
    "driveType" TEXT,
    "gearboxDetail" TEXT,
    "batteryCapacityPercent" INTEGER,
    "acChargerType" TEXT,
    "fastCharging" BOOLEAN NOT NULL DEFAULT false,
    "wltpRangeKm" INTEGER,
    "systemPowerKw" INTEGER,
    "systemPowerHp" INTEGER,
    "documentsType" TEXT,
    "inspectionValidUntil" TEXT,
    "frontTireSize" TEXT,
    "rearTireSize" TEXT,
    "interiorFeatures" TEXT,
    "technicalFeatures" TEXT,
    "exteriorFeatures" TEXT,
    "multimediaFeatures" TEXT,
    "extraInfo" TEXT,
    "historyInternationalEnabled" BOOLEAN NOT NULL DEFAULT true,
    "historyDomesticEnabled" BOOLEAN NOT NULL DEFAULT true,
    "vatDeductible" BOOLEAN NOT NULL DEFAULT false,
    "tradeInAvailable" BOOLEAN NOT NULL DEFAULT false,
    "availableImmediately" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("bodyType", "condition", "createdAt", "description", "fuel", "id", "location", "make", "mileage", "model", "price", "sellerId", "status", "transmission", "trim", "updatedAt", "year") SELECT "bodyType", "condition", "createdAt", "description", "fuel", "id", "location", "make", "mileage", "model", "price", "sellerId", "status", "transmission", "trim", "updatedAt", "year" FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
CREATE INDEX "Listing_status_createdAt_idx" ON "Listing"("status", "createdAt");
CREATE INDEX "Listing_make_model_idx" ON "Listing"("make", "model");
CREATE INDEX "Listing_price_idx" ON "Listing"("price");
CREATE INDEX "Listing_year_idx" ON "Listing"("year");
CREATE INDEX "Listing_mileage_idx" ON "Listing"("mileage");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
