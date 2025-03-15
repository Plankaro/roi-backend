/*
  Warnings:

  - A unique constraint covering the columns `[shopify_id]` on the table `Checkout` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopify_id` to the `Checkout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Checkout" ADD COLUMN     "shopify_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Checkout_shopify_id_key" ON "Checkout"("shopify_id");
