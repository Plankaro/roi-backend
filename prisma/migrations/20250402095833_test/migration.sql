-- AlterTable
ALTER TABLE "Checkout" ADD COLUMN     "businessId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "buisnessId" TEXT;

-- AlterTable
ALTER TABLE "PaymentLink" ADD COLUMN     "businessId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buisnessId_fkey" FOREIGN KEY ("buisnessId") REFERENCES "Business"("whatsapp_mobile") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkout" ADD CONSTRAINT "Checkout_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLink" ADD CONSTRAINT "PaymentLink_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
