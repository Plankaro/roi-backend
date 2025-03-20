/*
  Warnings:

  - Added the required column `customerLocale` to the `Checkout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Checkout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentmentCurrency` to the `Checkout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotalPrice` to the `Checkout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDiscounts` to the `Checkout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalDuties` to the `Checkout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalLineItemsPrice` to the `Checkout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Checkout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalTax` to the `Checkout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Checkout" ADD COLUMN     "billingAddress" JSONB,
ADD COLUMN     "customer" JSONB,
ADD COLUMN     "customerLocale" TEXT NOT NULL,
ADD COLUMN     "deviceIdentifier" TEXT,
ADD COLUMN     "lineItems" JSONB,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "noteAttributes" JSONB,
ADD COLUMN     "paymentGatewayId" TEXT,
ADD COLUMN     "presentmentCurrency" TEXT NOT NULL,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "shippingAddress" JSONB,
ADD COLUMN     "shipping_address" JSONB,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "sourceName" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "subtotalPrice" TEXT NOT NULL,
ADD COLUMN     "taxLines" JSONB,
ADD COLUMN     "totalDiscounts" TEXT NOT NULL,
ADD COLUMN     "totalDuties" TEXT NOT NULL,
ADD COLUMN     "totalLineItemsPrice" TEXT NOT NULL,
ADD COLUMN     "totalPrice" TEXT NOT NULL,
ADD COLUMN     "totalTax" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_checkout_id_fkey" FOREIGN KEY ("checkout_id") REFERENCES "Checkout"("shopify_id") ON DELETE SET NULL ON UPDATE CASCADE;
