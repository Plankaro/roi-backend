/*
  Warnings:

  - The values [abondoned_checkout,cod_to_prepaid,after_order_delivery] on the enum `CampaignType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ComponentData` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `Sucess` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `templateName` on the `Campaign` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "trigger_type" AS ENUM ('AFTER_CAMPAIGN_CREATED', 'CUSTOM');

-- CreateEnum
CREATE TYPE "time_amount" AS ENUM ('DAY', 'HOUR', 'MINUTE');

-- AlterEnum
BEGIN;
CREATE TYPE "CampaignType_new" AS ENUM ('ORDER_CREATED', 'ORDER_UPDATED', 'ORDER_CANCELLED', 'CHECKOUT_CREATED', 'FULFILLMENT_CREATED', 'FULFILLMENT_EVENT_CREATED', 'ORDER_TAG_ADDED');
ALTER TABLE "Campaign" ALTER COLUMN "type" TYPE "CampaignType_new" USING ("type"::text::"CampaignType_new");
ALTER TYPE "CampaignType" RENAME TO "CampaignType_old";
ALTER TYPE "CampaignType_new" RENAME TO "CampaignType";
DROP TYPE "CampaignType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_campaignId_fkey";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "ComponentData",
DROP COLUMN "Sucess",
DROP COLUMN "templateName";

-- CreateTable
CREATE TABLE "CheckoutCreatedCampaign" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "components" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "Condition_filter_match" BOOLEAN NOT NULL,
    "new_checkout_abondnment" BOOLEAN NOT NULL,
    "new_checkout_abondnment_type" "trigger_type" NOT NULL,
    "new_checkout_abondnment_trigger_time" INTEGER NOT NULL,
    "new_checkout_abondnment_trigger_time_amount" "time_amount" NOT NULL,
    "new_order_abondnment" BOOLEAN NOT NULL,
    "new_order_abondnment_type" "trigger_type" NOT NULL,
    "new_order_abondnment_trigger_time" INTEGER NOT NULL,
    "new_order_abondnment_trigger_time_amount" "time_amount" NOT NULL,
    "ordered_created" BOOLEAN NOT NULL,
    "order_cancelled" BOOLEAN NOT NULL,

    CONSTRAINT "CheckoutCreatedCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutCreatedCampaign_campaignId_key" ON "CheckoutCreatedCampaign"("campaignId");

-- AddForeignKey
ALTER TABLE "CheckoutCreatedCampaign" ADD CONSTRAINT "CheckoutCreatedCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
