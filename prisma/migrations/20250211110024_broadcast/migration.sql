/*
  Warnings:

  - You are about to drop the column `broadastContact` on the `Broadcast` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Broadcast" DROP COLUMN "broadastContact";

-- CreateTable
CREATE TABLE "BroadcastContact" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "buisnessNo" TEXT NOT NULL,

    CONSTRAINT "BroadcastContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BroadcastContact_prospectId_broadcastId_key" ON "BroadcastContact"("prospectId", "broadcastId");

-- AddForeignKey
ALTER TABLE "BroadcastContact" ADD CONSTRAINT "BroadcastContact_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BroadcastContact" ADD CONSTRAINT "BroadcastContact_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "Broadcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;
