-- CreateTable
CREATE TABLE "service_quotes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "businessName" TEXT NOT NULL DEFAULT '',
    "serviceType" TEXT NOT NULL,
    "projectDetails" TEXT NOT NULL,
    "budget" TEXT NOT NULL DEFAULT '',
    "timeline" TEXT NOT NULL DEFAULT '',
    "sourcePage" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_quotes_createdAt_idx" ON "service_quotes"("createdAt");

-- CreateIndex
CREATE INDEX "service_quotes_email_idx" ON "service_quotes"("email");
