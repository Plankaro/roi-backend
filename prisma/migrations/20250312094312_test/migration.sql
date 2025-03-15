/*
  Warnings:

  - Added the required column `discount_type` to the `CheckoutCreatedCampaign` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "discount_type" AS ENUM ('PERCENTAGE', 'AMOUNT');

-- AlterTable
ALTER TABLE "CheckoutCreatedCampaign" ADD COLUMN     "discount_type" "discount_type" NOT NULL;
