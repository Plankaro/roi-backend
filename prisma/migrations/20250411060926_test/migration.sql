/*
  Warnings:

  - A unique constraint covering the columns `[buisness_id,type]` on the table `Bots` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Bots" ALTER COLUMN "discount_amount" SET DEFAULT '10',
ALTER COLUMN "discount_amount" SET DATA TYPE TEXT,
ALTER COLUMN "discount_minimum" SET DEFAULT '200',
ALTER COLUMN "discount_minimum" SET DATA TYPE TEXT,
ALTER COLUMN "shipping_standard_cost" SET DEFAULT '150',
ALTER COLUMN "shipping_standard_cost" SET DATA TYPE TEXT,
ALTER COLUMN "shipping_threshold" SET DEFAULT '200',
ALTER COLUMN "shipping_threshold" SET DATA TYPE TEXT,
ALTER COLUMN "international_shipping_cost" SET DEFAULT '200',
ALTER COLUMN "international_shipping_cost" SET DATA TYPE TEXT,
ALTER COLUMN "discount_expiry" SET DEFAULT '7',
ALTER COLUMN "discount_expiry" SET DATA TYPE TEXT,
ALTER COLUMN "no_of_days_before_asking_discount" SET DEFAULT '7',
ALTER COLUMN "no_of_days_before_asking_discount" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Bots_buisness_id_type_key" ON "Bots"("buisness_id", "type");
