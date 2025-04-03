/*
  Warnings:

  - A unique constraint covering the columns `[shopify_domain]` on the table `Business` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Business_shopify_domain_key" ON "Business"("shopify_domain");
