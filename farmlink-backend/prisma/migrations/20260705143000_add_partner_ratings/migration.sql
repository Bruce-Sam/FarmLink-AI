-- CreateTable
CREATE TYPE "RatedRole" AS ENUM ('FARMER', 'BUYER');

CREATE TABLE "PartnerRating" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "raterUserId" TEXT NOT NULL,
    "ratedUserId" TEXT NOT NULL,
    "ratedRole" "RatedRole" NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerRating_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PartnerRating_transactionId_raterUserId_key" ON "PartnerRating"("transactionId", "raterUserId");
CREATE INDEX "PartnerRating_ratedUserId_idx" ON "PartnerRating"("ratedUserId");
CREATE INDEX "PartnerRating_ratedRole_idx" ON "PartnerRating"("ratedRole");
CREATE INDEX "PartnerRating_createdAt_idx" ON "PartnerRating"("createdAt");

ALTER TABLE "PartnerRating" ADD CONSTRAINT "PartnerRating_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "ProduceTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerRating" ADD CONSTRAINT "PartnerRating_raterUserId_fkey" FOREIGN KEY ("raterUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerRating" ADD CONSTRAINT "PartnerRating_ratedUserId_fkey" FOREIGN KEY ("ratedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
