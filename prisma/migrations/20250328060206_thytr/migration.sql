/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `createdForId` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `order_tag_filer_all` on the `Filter` table. All the data in the column will be lost.
  - You are about to drop the `CheckoutCreatedCampaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FullfillmentCreateCampaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FullfillmentEventCreateCampaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderCancelCampaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderTagAdded` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderUpdateCampaign` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orderCreatedCampaign` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `components` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discount_type` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filter_condition_match` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_checkout_abandonment_filter` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_order_creation_time` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_order_creation_type` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `related_order_created` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `related_order_fulfilled` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_lang` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_name` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_type` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trigger_time` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trigger_type` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_createdForId_fkey";

-- DropForeignKey
ALTER TABLE "CheckoutCreatedCampaign" DROP CONSTRAINT "CheckoutCreatedCampaign_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CheckoutOnCampaign" DROP CONSTRAINT "CheckoutOnCampaign_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "FullfillmentCreateCampaign" DROP CONSTRAINT "FullfillmentCreateCampaign_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "FullfillmentEventCreateCampaign" DROP CONSTRAINT "FullfillmentEventCreateCampaign_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "OrderCancelCampaign" DROP CONSTRAINT "OrderCancelCampaign_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "OrderTagAdded" DROP CONSTRAINT "OrderTagAdded_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "OrderUpdateCampaign" DROP CONSTRAINT "OrderUpdateCampaign_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "orderCreatedCampaign" DROP CONSTRAINT "orderCreatedCampaign_campaignId_fkey";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "createdAt",
DROP COLUMN "createdBy",
DROP COLUMN "createdForId",
DROP COLUMN "updatedAt",
ADD COLUMN     "businessId" TEXT,
ADD COLUMN     "components" JSONB NOT NULL,
ADD COLUMN     "coupon_code" TEXT,
ADD COLUMN     "discount" INTEGER,
ADD COLUMN     "discount_type" "discount_type" NOT NULL,
ADD COLUMN     "filter_condition_match" BOOLEAN NOT NULL,
ADD COLUMN     "is_discount_given" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "new_checkout_abandonment_filter" BOOLEAN NOT NULL,
ADD COLUMN     "new_checkout_abandonment_time" TEXT,
ADD COLUMN     "new_checkout_abandonment_type" "trigger_type",
ADD COLUMN     "new_order_creation_filter" BOOLEAN,
ADD COLUMN     "new_order_creation_time" TEXT NOT NULL,
ADD COLUMN     "new_order_creation_type" "trigger_type" NOT NULL,
ADD COLUMN     "related_order_created" BOOLEAN NOT NULL,
ADD COLUMN     "related_order_fulfilled" BOOLEAN NOT NULL,
ADD COLUMN     "template_lang" TEXT NOT NULL,
ADD COLUMN     "template_name" TEXT NOT NULL,
ADD COLUMN     "template_type" TEXT NOT NULL,
ADD COLUMN     "trigger_time" TEXT NOT NULL,
ADD COLUMN     "trigger_type" "campaign_trigger_type" NOT NULL,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Filter" DROP COLUMN "order_tag_filer_all",
ADD COLUMN     "order_tag_filter_all" TEXT[];

-- DropTable
DROP TABLE "CheckoutCreatedCampaign";

-- DropTable
DROP TABLE "FullfillmentCreateCampaign";

-- DropTable
DROP TABLE "FullfillmentEventCreateCampaign";

-- DropTable
DROP TABLE "OrderCancelCampaign";

-- DropTable
DROP TABLE "OrderTagAdded";

-- DropTable
DROP TABLE "OrderUpdateCampaign";

-- DropTable
DROP TABLE "orderCreatedCampaign";

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutOnCampaign" ADD CONSTRAINT "CheckoutOnCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
