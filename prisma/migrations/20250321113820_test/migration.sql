/*
  Warnings:

  - Added the required column `prospect_phone` to the `discount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "discount" ADD COLUMN     "prospect_phone" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "discount" ADD CONSTRAINT "discount_prospect_phone_fkey" FOREIGN KEY ("prospect_phone") REFERENCES "Prospect"("phoneNo") ON DELETE RESTRICT ON UPDATE CASCADE;
