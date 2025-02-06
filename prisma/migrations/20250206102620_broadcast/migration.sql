/*
  Warnings:

  - You are about to drop the column `starters` on the `Broadcast` table. All the data in the column will be lost.
  - Added the required column `status` to the `Broadcast` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Broadcast" DROP CONSTRAINT "Broadcast_createdBy_fkey";

-- AlterTable
ALTER TABLE "Broadcast" DROP COLUMN "starters",
ADD COLUMN     "broadastContact" TEXT[],
ADD COLUMN     "status" TEXT NOT NULL,
ALTER COLUMN "createdForId" DROP NOT NULL,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "broadcastId" TEXT,
ADD COLUMN     "isForBroadcast" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "Broadcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
