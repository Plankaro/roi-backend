/*
  Warnings:

  - The `TeamManagement` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('abondoned_checkout', 'delivery_update', 'cod_to_prepaid', 'after_order_delivery');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "isForCampaign" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "AssignChats" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "CampaignManageMent" "Acess" NOT NULL DEFAULT 'WRITE',
ALTER COLUMN "BroadcastManageMent" SET DEFAULT 'WRITE',
DROP COLUMN "TeamManagement",
ADD COLUMN     "TeamManagement" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "type" "CampaignType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "createdForId" TEXT,
    "templateName" TEXT NOT NULL,
    "ComponentData" JSONB NOT NULL,
    "Sucess" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_createdForId_fkey" FOREIGN KEY ("createdForId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
