/*
  Warnings:

  - Changed the type of `shopify_id` on the `Checkout` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Checkout" DROP COLUMN "shopify_id",
ADD COLUMN     "shopify_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Checkout_shopify_id_key" ON "Checkout"("shopify_id");
