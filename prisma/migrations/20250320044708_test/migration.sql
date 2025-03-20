-- AlterTable
ALTER TABLE "Filter" ADD COLUMN     "is_send_to_unsub_customer_filter_enabled" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "send_to_unsub_customer" DROP NOT NULL,
ALTER COLUMN "send_to_unsub_customer" DROP DEFAULT;
