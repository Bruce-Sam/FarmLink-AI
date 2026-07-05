-- AlterTable
ALTER TABLE "ProduceListing" ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
