-- AlterTable
ALTER TABLE "IntranetAccessRequest" ADD COLUMN "claimTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "IntranetAccessRequest_claimTokenHash_key" ON "IntranetAccessRequest"("claimTokenHash");
