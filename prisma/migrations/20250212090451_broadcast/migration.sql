/*
  Warnings:

  - You are about to drop the `BroadcastContact` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `BroadCastId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BroadcastContact" DROP CONSTRAINT "BroadcastContact_broadcastId_fkey";

-- DropForeignKey
ALTER TABLE "BroadcastContact" DROP CONSTRAINT "BroadcastContact_prospectId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "BroadCastId" TEXT NOT NULL,
ADD COLUMN     "fromBroadcast" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "BroadcastContact";

-- CreateTable
CREATE TABLE "Contacts" (
    "id" TEXT NOT NULL,
    "phoneNo" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "status" TEXT,
    "createdBy" TEXT,
    "BroadCastId" TEXT NOT NULL,

    CONSTRAINT "Contacts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_BroadCastId_fkey" FOREIGN KEY ("BroadCastId") REFERENCES "Broadcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contacts" ADD CONSTRAINT "Contacts_BroadCastId_fkey" FOREIGN KEY ("BroadCastId") REFERENCES "Broadcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;
