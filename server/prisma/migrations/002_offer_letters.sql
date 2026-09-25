-- CreateTable
CREATE TABLE IF NOT EXISTS "offer_letters" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "applicationRef" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "pdfBytes" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_letters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "offer_letters_applicationId_key" ON "offer_letters"("applicationId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'offer_letters_applicationId_fkey'
  ) THEN
    ALTER TABLE "offer_letters"
      ADD CONSTRAINT "offer_letters_applicationId_fkey"
      FOREIGN KEY ("applicationId") REFERENCES "internship_applications"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
