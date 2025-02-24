/*
  Warnings:

  - You are about to drop the column `is_utm_id_embeded` on the `Broadcast` table. All the data in the column will be lost.
  - You are about to drop the column `utm_params` on the `Broadcast` table. All the data in the column will be lost.
  - The `utm_term` column on the `Broadcast` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `componentData` to the `Broadcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contacts_type` to the `Broadcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `excelData` to the `Broadcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `onlimit_exced` to the `Broadcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skip_inactive_contacts_days` to the `Broadcast` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('excel', 'shopify');

-- CreateEnum
CREATE TYPE "Limitexced" AS ENUM ('pause', 'skip');

-- AlterTable
ALTER TABLE "Broadcast" DROP COLUMN "is_utm_id_embeded",
DROP COLUMN "utm_params",
ADD COLUMN     "avoid_duplicate" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "componentData" JSONB NOT NULL,
ADD COLUMN     "contacts_type" "ContactType" NOT NULL,
ADD COLUMN     "excelData" JSONB NOT NULL,
ADD COLUMN     "limit_marketing_message_duration" TEXT,
ADD COLUMN     "limit_marketing_message_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "limit_marketing_message_messagenumber" INTEGER,
ADD COLUMN     "onlimit_exced" "Limitexced" NOT NULL,
ADD COLUMN     "retry_limit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "segment_id" TEXT,
ADD COLUMN     "skip_inactive_contacts_days" INTEGER NOT NULL,
ADD COLUMN     "skip_inactive_contacts_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "utm_id" BOOLEAN DEFAULT false,
ADD COLUMN     "utm_medium" TEXT,
DROP COLUMN "utm_term",
ADD COLUMN     "utm_term" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "isForRetry" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "retryId" TEXT;

-- CreateTable
CREATE TABLE "Retry" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Retry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_retryId_fkey" FOREIGN KEY ("retryId") REFERENCES "Retry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retry" ADD CONSTRAINT "Retry_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "Broadcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
