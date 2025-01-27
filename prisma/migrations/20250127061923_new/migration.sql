/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[shopify_id]` on the table `Prospect` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shopify_id` to the `Prospect` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_orderedForId_fkey";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "template_used" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "businessId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "shopify_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "Order";

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_shopify_id_key" ON "Prospect"("shopify_id");
