/*
  Warnings:

  - A unique constraint covering the columns `[cart_token]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[checkout_id]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[checkout_token]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "cart_token" TEXT,
ADD COLUMN     "checkout_id" TEXT,
ADD COLUMN     "checkout_token" TEXT,
ADD COLUMN     "closed_at" TIMESTAMP(3),
ADD COLUMN     "confirmation_number" TEXT,
ADD COLUMN     "confirmed" BOOLEAN,
ADD COLUMN     "contact_email" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3),
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "current_shipping_price_set" JSONB,
ADD COLUMN     "current_subtotal_price_set" JSONB,
ADD COLUMN     "current_total_additional_fees_set" JSONB,
ADD COLUMN     "current_total_discounts" TEXT,
ADD COLUMN     "current_total_discounts_set" JSONB,
ADD COLUMN     "current_total_duties_set" JSONB,
ADD COLUMN     "current_total_price" TEXT,
ADD COLUMN     "current_total_price_set" JSONB,
ADD COLUMN     "current_total_tax" TEXT,
ADD COLUMN     "current_total_tax_set" JSONB,
ADD COLUMN     "discount_codes" JSONB,
ADD COLUMN     "fulfillment_status" TEXT,
ADD COLUMN     "landing_site" TEXT,
ADD COLUMN     "landing_site_ref" TEXT,
ADD COLUMN     "merchant_business_entity_id" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "order_number" INTEGER,
ADD COLUMN     "original_total_additional_fees_set" JSONB,
ADD COLUMN     "original_total_duties_set" JSONB,
ADD COLUMN     "payment_gateway_names" TEXT[],
ADD COLUMN     "shipping_lines" JSONB,
ADD COLUMN     "subtotal_price" TEXT,
ADD COLUMN     "subtotal_price_set" JSONB,
ADD COLUMN     "tax_lines" JSONB,
ADD COLUMN     "taxes_included" BOOLEAN,
ADD COLUMN     "test" BOOLEAN,
ADD COLUMN     "total_cash_rounding_payment_adjustment_set" JSONB,
ADD COLUMN     "total_cash_rounding_refund_adjustment_set" JSONB,
ADD COLUMN     "total_discounts" TEXT,
ADD COLUMN     "total_discounts_set" JSONB,
ADD COLUMN     "total_line_items_price" TEXT,
ADD COLUMN     "total_line_items_price_set" JSONB,
ADD COLUMN     "total_outstanding" TEXT,
ADD COLUMN     "total_price" TEXT,
ADD COLUMN     "total_price_set" JSONB,
ADD COLUMN     "total_shipping_price_set" JSONB,
ADD COLUMN     "total_tax" TEXT,
ADD COLUMN     "total_weight" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Order_cart_token_key" ON "Order"("cart_token");

-- CreateIndex
CREATE UNIQUE INDEX "Order_checkout_id_key" ON "Order"("checkout_id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_checkout_token_key" ON "Order"("checkout_token");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_checkout_id_fkey" FOREIGN KEY ("checkout_id") REFERENCES "Checkout"("shopify_id") ON DELETE SET NULL ON UPDATE CASCADE;
