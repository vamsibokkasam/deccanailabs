-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'reviewed', 'accepted', 'rejected', 'completed');

-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('internship', 'course');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('upi');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('valid', 'revoked');

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duration" TEXT NOT NULL DEFAULT '8-12 weeks',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "programTitle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_applications" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "college" TEXT NOT NULL DEFAULT '',
    "registrationNo" TEXT NOT NULL DEFAULT '',
    "department" TEXT NOT NULL DEFAULT '',
    "internshipStartDate" TIMESTAMP(3),
    "internshipEndDate" TIMESTAMP(3),
    "batchId" TEXT,
    "program" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "source" "ApplicationSource" NOT NULL DEFAULT 'internship',
    "feeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMethod" "PaymentMethod",
    "paymentTransactionId" TEXT,
    "paymentScreenshotData" TEXT,
    "paymentStatus" "PaymentStatus",
    "paymentVerifiedAt" TIMESTAMP(3),
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "completedAt" TIMESTAMP(3),
    "certificateEmailedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "certNo" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL DEFAULT '',
    "department" TEXT NOT NULL DEFAULT '',
    "college" TEXT NOT NULL DEFAULT '',
    "internshipDomain" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "applicationId" TEXT,
    "status" "CertificateStatus" NOT NULL DEFAULT 'valid',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "internship" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sequence_counters" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sequence_counters_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "internship_applications_applicationId_key" ON "internship_applications"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "internship_applications_paymentTransactionId_key" ON "internship_applications"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "internship_applications_batchId_idx" ON "internship_applications"("batchId");

-- CreateIndex
CREATE INDEX "internship_applications_email_idx" ON "internship_applications"("email");

-- CreateIndex
CREATE INDEX "internship_applications_status_idx" ON "internship_applications"("status");

-- CreateIndex
CREATE INDEX "internship_applications_program_idx" ON "internship_applications"("program");

-- CreateIndex
CREATE INDEX "batches_programId_startDate_idx" ON "batches"("programId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_certNo_key" ON "certificates"("certNo");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_applicationId_key" ON "certificates"("applicationId");

-- AddForeignKey
ALTER TABLE "batches" ADD CONSTRAINT "batches_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "internship_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
