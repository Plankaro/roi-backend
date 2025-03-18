/*
  Warnings:

  - You are about to drop the column `trigger_time_unit` on the `FullfillmentCreateCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `trigger_time_unit` on the `FullfillmentEventCreateCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `trigger_time_unit` on the `OrderUpdateCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `trigger_time_unit` on the `orderCreatedCampaign` table. All the data in the column will be lost.
  - Added the required column `trigger_time` to the `FullfillmentCreateCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trigger_time` to the `FullfillmentEventCreateCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trigger_time` to the `OrderUpdateCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trigger_time` to the `orderCreatedCampaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FullfillmentCreateCampaign" DROP COLUMN "trigger_time_unit",
ADD COLUMN     "trigger_time" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FullfillmentEventCreateCampaign" DROP COLUMN "trigger_time_unit",
ADD COLUMN     "trigger_time" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderUpdateCampaign" DROP COLUMN "trigger_time_unit",
ADD COLUMN     "trigger_time" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orderCreatedCampaign" DROP COLUMN "trigger_time_unit",
ADD COLUMN     "trigger_time" TEXT NOT NULL;
