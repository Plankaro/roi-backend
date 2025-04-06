/*
  Warnings:

  - You are about to drop the column `prospect_phone` on the `discount` table. All the data in the column will be lost.
  - Added the required column `prospect_id` to the `discount` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "discount" DROP CONSTRAINT "discount_prospect_phone_fkey";

-- DropIndex
DROP INDEX "Prospect_phoneNo_key";

-- AlterTable
ALTER TABLE "discount" DROP COLUMN "prospect_phone",
ADD COLUMN     "prospect_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "discount" ADD CONSTRAINT "discount_prospect_id_fkey" FOREIGN KEY ("prospect_id") REFERENCES "Prospect"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
