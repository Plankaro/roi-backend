-- CreateTable
CREATE TABLE "OrderCampaign" (
    "orderId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderCampaign_pkey" PRIMARY KEY ("orderId","campaignId")
);

-- AddForeignKey
ALTER TABLE "OrderCampaign" ADD CONSTRAINT "OrderCampaign_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderCampaign" ADD CONSTRAINT "OrderCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
