/*
  Warnings:

  - You are about to drop the column `businessId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `Status` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_name` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ');

-- CreateEnum
CREATE TYPE "HeaderType" AS ENUM ('Image', 'Video');

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "businessId",
ADD COLUMN     "Status" "MessageStatus" NOT NULL,
ADD COLUMN     "body_attachmentUrl" TEXT[],
ADD COLUMN     "body_attachment_included" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "body_text" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "footer_included" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "footer_text" TEXT,
ADD COLUMN     "footer_url" TEXT,
ADD COLUMN     "header_type" "HeaderType",
ADD COLUMN     "header_url" TEXT,
ADD COLUMN     "template_name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Message";
