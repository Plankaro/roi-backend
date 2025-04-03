-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_buisnessId_fkey";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buisnessId_fkey" FOREIGN KEY ("buisnessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
