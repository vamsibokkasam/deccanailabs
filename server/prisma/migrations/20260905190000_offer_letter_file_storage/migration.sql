-- AlterTable
ALTER TABLE "offer_letters" ADD COLUMN IF NOT EXISTS "storagePath" TEXT;

DO $$
BEGIN
  ALTER TABLE "offer_letters" ALTER COLUMN "pdfBytes" DROP NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;
