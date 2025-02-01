/*
  Warnings:

  - The values [PENDING,SENT,DELIVERED,READ] on the enum `MessageStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `body_attachment_included` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `Chat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chatId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiverPhoneNo` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderPhoneNo` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('image', 'text', 'document');

-- AlterEnum
ALTER TYPE "HeaderType" ADD VALUE 'Document';

-- AlterEnum
BEGIN;
CREATE TYPE "MessageStatus_new" AS ENUM ('pending', 'sent', 'delivered', 'read');
ALTER TABLE "Chat" ALTER COLUMN "Status" TYPE "MessageStatus_new" USING ("Status"::text::"MessageStatus_new");
ALTER TYPE "MessageStatus" RENAME TO "MessageStatus_old";
ALTER TYPE "MessageStatus_new" RENAME TO "MessageStatus";
DROP TYPE "MessageStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_receiverId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "body_attachment_included",
DROP COLUMN "receiverId",
ADD COLUMN     "body_type" "BodyType" NOT NULL DEFAULT 'text',
ADD COLUMN     "prospectId" TEXT,
ADD COLUMN     "receiverPhoneNo" TEXT NOT NULL,
ADD COLUMN     "senderPhoneNo" TEXT NOT NULL,
ALTER COLUMN "Status" SET DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "Chat_chatId_key" ON "Chat"("chatId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;
