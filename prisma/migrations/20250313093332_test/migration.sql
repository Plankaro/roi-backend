/*
  Warnings:

  - You are about to drop the column `current_shipping_price_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `current_subtotal_price_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `current_total_additional_fees_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `current_total_discounts` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `current_total_discounts_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `current_total_duties_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `current_total_price` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `current_total_price_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `current_total_tax` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `current_total_tax_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `landing_site_ref` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `original_total_additional_fees_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `original_total_duties_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `payment_gateway_names` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal_price` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal_price_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `tax_lines` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `taxes_included` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `test` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_cash_rounding_payment_adjustment_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_cash_rounding_refund_adjustment_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_discounts` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_discounts_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_line_items_price` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_line_items_price_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_outstanding` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_price` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_price_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_shipping_price_set` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total_tax` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "current_shipping_price_set",
DROP COLUMN "current_subtotal_price_set",
DROP COLUMN "current_total_additional_fees_set",
DROP COLUMN "current_total_discounts",
DROP COLUMN "current_total_discounts_set",
DROP COLUMN "current_total_duties_set",
DROP COLUMN "current_total_price",
DROP COLUMN "current_total_price_set",
DROP COLUMN "current_total_tax",
DROP COLUMN "current_total_tax_set",
DROP COLUMN "landing_site_ref",
DROP COLUMN "original_total_additional_fees_set",
DROP COLUMN "original_total_duties_set",
DROP COLUMN "payment_gateway_names",
DROP COLUMN "subtotal_price",
DROP COLUMN "subtotal_price_set",
DROP COLUMN "tax_lines",
DROP COLUMN "taxes_included",
DROP COLUMN "test",
DROP COLUMN "total_cash_rounding_payment_adjustment_set",
DROP COLUMN "total_cash_rounding_refund_adjustment_set",
DROP COLUMN "total_discounts",
DROP COLUMN "total_discounts_set",
DROP COLUMN "total_line_items_price",
DROP COLUMN "total_line_items_price_set",
DROP COLUMN "total_outstanding",
DROP COLUMN "total_price",
DROP COLUMN "total_price_set",
DROP COLUMN "total_shipping_price_set",
DROP COLUMN "total_tax";
