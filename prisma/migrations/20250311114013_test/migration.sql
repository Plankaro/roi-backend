/*
  Warnings:

  - You are about to drop the column `orderId` on the `orderCreatedCampaign` table. All the data in the column will be lost.
  - Added the required column `description` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orderCreatedCampaign" DROP COLUMN "orderId";
