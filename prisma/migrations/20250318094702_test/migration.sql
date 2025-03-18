/*
  Warnings:

  - You are about to drop the column `trigger_time_unit` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - Added the required column `trigger_time` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CheckoutCreatedCampaign" DROP COLUMN "trigger_time_unit",
ADD COLUMN     "trigger_time" TEXT NOT NULL;
