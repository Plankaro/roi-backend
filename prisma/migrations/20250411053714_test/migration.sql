/*
  Warnings:

  - You are about to drop the column `discount_days` on the `Bots` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bots" DROP COLUMN "discount_days",
ADD COLUMN     "discount_expiry" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "no_of_days_before_asking_discount" INTEGER NOT NULL DEFAULT 7,
ALTER COLUMN "discount_amount" SET DEFAULT 10,
ALTER COLUMN "discount_minimum" SET DEFAULT 200,
ALTER COLUMN "is_active" SET DEFAULT true;
