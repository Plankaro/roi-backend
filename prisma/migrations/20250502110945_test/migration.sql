-- CreateEnum
CREATE TYPE "minmax" AS ENUM ('greater', 'less', 'custom');

-- AlterTable
ALTER TABLE "Filter" ADD COLUMN     "discount_amount_type" "minmax",
ADD COLUMN     "order_amount_type" "minmax";
