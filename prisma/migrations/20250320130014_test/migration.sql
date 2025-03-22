/*
  Warnings:

  - You are about to drop the `ProductTagAdded` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductTagAdded" DROP CONSTRAINT "ProductTagAdded_campaignId_fkey";

-- DropTable
DROP TABLE "ProductTagAdded";

-- CreateTable
CREATE TABLE "OrderTagAdded" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "template_name" TEXT NOT NULL,
    "template_type" TEXT NOT NULL,
    "template_lang" TEXT NOT NULL,
    "components" JSONB NOT NULL,
    "trigger_type" "campaign_trigger_type" NOT NULL,
    "trigger_time" TEXT NOT NULL,
    "filter_condition_match" BOOLEAN NOT NULL,
    "new_checkout_abandonment_filter" BOOLEAN NOT NULL,
    "new_checkout_abandonment_type" "trigger_type",
    "new_checkout_abandonment_time" TEXT,
    "new_order_creation_filter" BOOLEAN,
    "new_order_creation_type" "trigger_type" NOT NULL,
    "new_order_creation_time" TEXT NOT NULL,
    "related_order_created" BOOLEAN NOT NULL,
    "related_order_fullfilled" BOOLEAN NOT NULL,

    CONSTRAINT "OrderTagAdded_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderTagAdded_campaignId_key" ON "OrderTagAdded"("campaignId");

-- AddForeignKey
ALTER TABLE "OrderTagAdded" ADD CONSTRAINT "OrderTagAdded_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
