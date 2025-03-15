/*
  Warnings:

  - You are about to drop the column `new_checkout_abondnment` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `new_checkout_abondnment_trigger_time` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `new_checkout_abondnment_trigger_time_unit` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `new_checkout_abondnment_type` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `new_order_creation_trigger_time` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `new_order_creation_trigger_time_unit` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `ordered_created` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - Added the required column `new_checkout_abandonment` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_checkout_abandonment_time` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_checkout_abandonment_type` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_checkout_abandonment_unit` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_order_creation_time` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_order_creation_unit` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_created` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CheckoutCreatedCampaign" DROP COLUMN "new_checkout_abondnment",
DROP COLUMN "new_checkout_abondnment_trigger_time",
DROP COLUMN "new_checkout_abondnment_trigger_time_unit",
DROP COLUMN "new_checkout_abondnment_type",
DROP COLUMN "new_order_creation_trigger_time",
DROP COLUMN "new_order_creation_trigger_time_unit",
DROP COLUMN "ordered_created",
ADD COLUMN     "new_checkout_abandonment" BOOLEAN NOT NULL,
ADD COLUMN     "new_checkout_abandonment_time" INTEGER NOT NULL,
ADD COLUMN     "new_checkout_abandonment_type" "trigger_type" NOT NULL,
ADD COLUMN     "new_checkout_abandonment_unit" "time_unit" NOT NULL,
ADD COLUMN     "new_order_creation_time" INTEGER NOT NULL,
ADD COLUMN     "new_order_creation_unit" "time_unit" NOT NULL,
ADD COLUMN     "order_created" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "Checkout" (
    "id" TEXT NOT NULL,
    "mobile_no" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "cartToken" TEXT NOT NULL,
    "email" TEXT,
    "gateway" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "landingSite" TEXT NOT NULL,
    "shippingLines" JSONB,
    "shippingAddress" JSONB,
    "taxesIncluded" BOOLEAN NOT NULL,
    "totalWeight" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "phone" TEXT,
    "customerLocale" TEXT NOT NULL,
    "lineItems" JSONB,
    "name" TEXT NOT NULL,
    "abandonedCheckoutUrl" TEXT NOT NULL,
    "discountCodes" JSONB,
    "taxLines" JSONB,
    "presentmentCurrency" TEXT NOT NULL,
    "sourceName" TEXT,
    "totalLineItemsPrice" TEXT NOT NULL,
    "totalTax" TEXT NOT NULL,
    "totalDiscounts" TEXT NOT NULL,
    "subtotalPrice" TEXT NOT NULL,
    "totalPrice" TEXT NOT NULL,
    "totalDuties" TEXT NOT NULL,
    "userId" TEXT,
    "sourceUrl" TEXT,
    "source" TEXT,
    "closedAt" TIMESTAMP(3),
    "for_campaign" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutOnCampaign" (
    "checkoutId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckoutOnCampaign_pkey" PRIMARY KEY ("checkoutId","campaignId")
);

-- AddForeignKey
ALTER TABLE "CheckoutOnCampaign" ADD CONSTRAINT "CheckoutOnCampaign_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "Checkout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutOnCampaign" ADD CONSTRAINT "CheckoutOnCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CheckoutCreatedCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
