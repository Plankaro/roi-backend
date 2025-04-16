/*
  Warnings:

  - A unique constraint covering the columns `[shopify_id]` on the table `Fulfillment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Fulfillment_shopify_id_key" ON "Fulfillment"("shopify_id");
