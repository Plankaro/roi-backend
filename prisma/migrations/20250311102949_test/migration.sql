/*
  Warnings:

  - You are about to drop the column `new_checkout_abondnment_trigger_time_amount` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `new_order_abondnment_trigger_time_amount` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - Added the required column `new_checkout_abondnment_trigger_time_unit` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_order_abondnment_trigger_time_unit` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `components` on the `CheckoutCreatedCampaign` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OrderTrigger_Type" AS ENUM ('IMMEDIATE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "time_unit" AS ENUM ('DAY', 'HOUR', 'MINUTE');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_propspect_id_fkey";

-- AlterTable
ALTER TABLE "CheckoutCreatedCampaign" DROP COLUMN "new_checkout_abondnment_trigger_time_amount",
DROP COLUMN "new_order_abondnment_trigger_time_amount",
ADD COLUMN     "new_checkout_abondnment_trigger_time_unit" "time_unit" NOT NULL,
ADD COLUMN     "new_order_abondnment_trigger_time_unit" "time_unit" NOT NULL,
DROP COLUMN "components",
ADD COLUMN     "components" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shopify_store" TEXT,
ALTER COLUMN "propspect_id" DROP NOT NULL;

-- DropEnum
DROP TYPE "time_amount";

-- CreateTable
CREATE TABLE "orderCreatedCampaign" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "components" JSONB NOT NULL,
    "trigger_time" INTEGER NOT NULL,
    "trigger_time_unit" "time_unit" NOT NULL,
    "Condition_filter_match" BOOLEAN NOT NULL,
    "new_checkout_abondnment" BOOLEAN NOT NULL,

    CONSTRAINT "orderCreatedCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orderCreatedCampaign_campaignId_key" ON "orderCreatedCampaign"("campaignId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_propspect_id_fkey" FOREIGN KEY ("propspect_id") REFERENCES "Prospect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderCreatedCampaign" ADD CONSTRAINT "orderCreatedCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
