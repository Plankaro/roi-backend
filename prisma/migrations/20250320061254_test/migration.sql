-- AlterTable
ALTER TABLE "Filter" ADD COLUMN     "is_order_count_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order_count_greater_or_equal" INTEGER,
ADD COLUMN     "order_count_less_or_equal" INTEGER,
ADD COLUMN     "order_count_max" INTEGER,
ADD COLUMN     "order_count_min" INTEGER;
