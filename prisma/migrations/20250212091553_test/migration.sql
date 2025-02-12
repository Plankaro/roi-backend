-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_prospect_shopify_id_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "prospect_shopify_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_prospect_shopify_id_fkey" FOREIGN KEY ("prospect_shopify_id") REFERENCES "Prospect"("shopify_id") ON DELETE SET NULL ON UPDATE CASCADE;
