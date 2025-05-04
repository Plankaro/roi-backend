/*
  Warnings:

  - You are about to drop the column `OrderId` on the `LinkTrack` table. All the data in the column will be lost.
  - You are about to drop the column `order_generated` on the `LinkTrack` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LinkTrack" DROP CONSTRAINT "LinkTrack_OrderId_fkey";

-- AlterTable
ALTER TABLE "LinkTrack" DROP COLUMN "OrderId",
DROP COLUMN "order_generated";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "linkTrackId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_linkTrackId_fkey" FOREIGN KEY ("linkTrackId") REFERENCES "LinkTrack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
