/*
  Warnings:

  - Added the required column `trigger_time` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trigger_time_unit` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CheckoutCreatedCampaign" ADD COLUMN     "trigger_time" INTEGER NOT NULL,
ADD COLUMN     "trigger_time_unit" "time_unit" NOT NULL;
