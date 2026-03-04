-- AlterTable
ALTER TABLE "User" ADD COLUMN "resetPasswordTokenHash" TEXT,
ADD COLUMN "resetPasswordExpiresAt" TIMESTAMP(3);
