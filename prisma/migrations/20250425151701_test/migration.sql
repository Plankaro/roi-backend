-- DropForeignKey
ALTER TABLE "LinkTrack" DROP CONSTRAINT "LinkTrack_id_fkey";

-- AddForeignKey
ALTER TABLE "LinkTrack" ADD CONSTRAINT "LinkTrack_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
