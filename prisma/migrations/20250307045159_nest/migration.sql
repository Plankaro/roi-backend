/*
  Warnings:

  - You are about to drop the column `TeamManagement` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "TeamManagement",
ADD COLUMN     "TeamManagementAcess" BOOLEAN DEFAULT true,
ALTER COLUMN "AssignChats" DROP NOT NULL,
ALTER COLUMN "CampaignManageMent" DROP NOT NULL;
