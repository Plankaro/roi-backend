/*
  Warnings:

  - Added the required column `amount` to the `discount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `discount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `discount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "discount" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "type" "discount_type" NOT NULL,
ADD COLUMN     "usageLimit" INTEGER;
