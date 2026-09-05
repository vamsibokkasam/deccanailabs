-- AlterTable
ALTER TABLE "offer_letters" ADD COLUMN "storagePath" TEXT;
ALTER TABLE "offer_letters" ALTER COLUMN "pdfBytes" DROP NOT NULL;
