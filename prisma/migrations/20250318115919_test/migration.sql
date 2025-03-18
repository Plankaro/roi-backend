-- AlterTable
ALTER TABLE "Filter" ALTER COLUMN "payment_options_type" DROP NOT NULL;

-- CreateTable
CREATE TABLE "OrderCancelCampaign" (
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

    CONSTRAINT "OrderCancelCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTagAdded" (
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

    CONSTRAINT "ProductTagAdded_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderCancelCampaign_campaignId_key" ON "OrderCancelCampaign"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTagAdded_campaignId_key" ON "ProductTagAdded"("campaignId");

-- AddForeignKey
ALTER TABLE "OrderCancelCampaign" ADD CONSTRAINT "OrderCancelCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTagAdded" ADD CONSTRAINT "ProductTagAdded_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
