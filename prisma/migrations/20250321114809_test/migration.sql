/*
  Warnings:

  - Made the column `prospect_phone` on table `discount` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "discount" DROP CONSTRAINT "discount_prospect_phone_fkey";

-- AlterTable
ALTER TABLE "discount" ALTER COLUMN "prospect_phone" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "discount" ADD CONSTRAINT "discount_prospect_phone_fkey" FOREIGN KEY ("prospect_phone") REFERENCES "Prospect"("phoneNo") ON DELETE RESTRICT ON UPDATE CASCADE;
