/*
  Warnings:

  - Added the required column `template_lang` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_type` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_lang` to the `orderCreatedCampaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_type` to the `orderCreatedCampaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CheckoutCreatedCampaign" ADD COLUMN     "template_lang" TEXT NOT NULL,
ADD COLUMN     "template_type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orderCreatedCampaign" ADD COLUMN     "template_lang" TEXT NOT NULL,
ADD COLUMN     "template_type" TEXT NOT NULL;
