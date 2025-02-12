-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_BroadCastId_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "BroadCastId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_BroadCastId_fkey" FOREIGN KEY ("BroadCastId") REFERENCES "Broadcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;
