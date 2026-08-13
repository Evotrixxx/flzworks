-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingPhoto" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntranetAccessRequest" (
    "id" TEXT NOT NULL,
    "module" TEXT NOT NULL DEFAULT 'autopiac',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approveTokenHash" TEXT NOT NULL,
    "denyTokenHash" TEXT NOT NULL,
    "claimTokenHash" TEXT,
    "approvedAt" TIMESTAMP(3),
    "deniedAt" TIMESTAMP(3),
    "accessedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "grantedDurationDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntranetAccessRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntranetIpBlock" (
    "id" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntranetIpBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioArticle" (
    "id" TEXT NOT NULL,
    "folderName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "category" TEXT NOT NULL DEFAULT 'CAR_DESIGN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlzProject" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tools" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "gradient" TEXT,
    "body" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "linkUrl" TEXT,
    "imageUrl" TEXT,
    "socialPlatform" TEXT,
    "socialPostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlzProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlzSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlzSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "FlzContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'portfolio',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlzContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelemetrySession" (
    "id" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationMs" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TelemetrySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TelemetryEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT,
    "dedupeKey" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TelemetryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Listing_status_createdAt_idx" ON "Listing"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_make_model_idx" ON "Listing"("make", "model");

-- CreateIndex
CREATE INDEX "Listing_price_idx" ON "Listing"("price");

-- CreateIndex
CREATE INDEX "Listing_year_idx" ON "Listing"("year");

-- CreateIndex
CREATE INDEX "Listing_mileage_idx" ON "Listing"("mileage");

-- CreateIndex
CREATE INDEX "ListingPhoto_listingId_sortOrder_idx" ON "ListingPhoto"("listingId", "sortOrder");

-- CreateIndex
CREATE INDEX "Favorite_listingId_idx" ON "Favorite"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");

-- CreateIndex
CREATE INDEX "SavedSearch_userId_createdAt_idx" ON "SavedSearch"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IntranetAccessRequest_approveTokenHash_key" ON "IntranetAccessRequest"("approveTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "IntranetAccessRequest_denyTokenHash_key" ON "IntranetAccessRequest"("denyTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "IntranetAccessRequest_claimTokenHash_key" ON "IntranetAccessRequest"("claimTokenHash");

-- CreateIndex
CREATE INDEX "IntranetAccessRequest_module_ipAddress_status_expiresAt_idx" ON "IntranetAccessRequest"("module", "ipAddress", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "IntranetAccessRequest_email_createdAt_idx" ON "IntranetAccessRequest"("email", "createdAt");

-- CreateIndex
CREATE INDEX "IntranetIpBlock_ipAddress_expiresAt_idx" ON "IntranetIpBlock"("ipAddress", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioArticle_folderName_key" ON "PortfolioArticle"("folderName");

-- CreateIndex
CREATE INDEX "FlzProject_visible_sortOrder_idx" ON "FlzProject"("visible", "sortOrder");

-- CreateIndex
CREATE INDEX "FlzProject_category_idx" ON "FlzProject"("category");

-- CreateIndex
CREATE UNIQUE INDEX "FlzProject_socialPlatform_socialPostId_key" ON "FlzProject"("socialPlatform", "socialPostId");

-- CreateIndex
CREATE INDEX "FlzContactMessage_status_createdAt_idx" ON "FlzContactMessage"("status", "createdAt");

-- CreateIndex
CREATE INDEX "FlzContactMessage_createdAt_idx" ON "FlzContactMessage"("createdAt");

-- CreateIndex
CREATE INDEX "TelemetrySession_site_startedAt_idx" ON "TelemetrySession"("site", "startedAt");

-- CreateIndex
CREATE INDEX "TelemetrySession_lastSeenAt_idx" ON "TelemetrySession"("lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "TelemetryEvent_dedupeKey_key" ON "TelemetryEvent"("dedupeKey");

-- CreateIndex
CREATE INDEX "TelemetryEvent_site_type_occurredAt_idx" ON "TelemetryEvent"("site", "type", "occurredAt");

-- CreateIndex
CREATE INDEX "TelemetryEvent_sessionId_occurredAt_idx" ON "TelemetryEvent"("sessionId", "occurredAt");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPhoto" ADD CONSTRAINT "ListingPhoto_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TelemetryEvent" ADD CONSTRAINT "TelemetryEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TelemetrySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

