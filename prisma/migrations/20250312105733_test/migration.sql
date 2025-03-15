/*
  Warnings:

  - You are about to drop the column `new_order_abondnment` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `new_order_abondnment_trigger_time` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `new_order_abondnment_trigger_time_unit` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - You are about to drop the column `new_order_abondnment_type` on the `CheckoutCreatedCampaign` table. All the data in the column will be lost.
  - Added the required column `new_order_creation` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_order_creation_trigger_time` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_order_creation_trigger_time_unit` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `new_order_creation_type` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CheckoutCreatedCampaign" DROP COLUMN "new_order_abondnment",
DROP COLUMN "new_order_abondnment_trigger_time",
DROP COLUMN "new_order_abondnment_trigger_time_unit",
DROP COLUMN "new_order_abondnment_type",
ADD COLUMN     "new_order_creation" BOOLEAN NOT NULL,
ADD COLUMN     "new_order_creation_trigger_time" INTEGER NOT NULL,
ADD COLUMN     "new_order_creation_trigger_time_unit" "time_unit" NOT NULL,
ADD COLUMN     "new_order_creation_type" "trigger_type" NOT NULL;
