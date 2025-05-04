/*
  Warnings:

  - You are about to drop the column `order_count_filter_max` on the `Filter` table. All the data in the column will be lost.
  - You are about to drop the column `order_count_filter_min` on the `Filter` table. All the data in the column will be lost.
  - You are about to drop the column `order_count_less_filter_or_equal` on the `Filter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Filter" DROP COLUMN "order_count_filter_max",
DROP COLUMN "order_count_filter_min",
DROP COLUMN "order_count_less_filter_or_equal",
ADD COLUMN     "order_count_filter_less_or_equal" INTEGER,
ADD COLUMN     "order_count_max" INTEGER,
ADD COLUMN     "order_count_min" INTEGER;
