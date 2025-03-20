/*
  Warnings:

  - You are about to drop the column `customer` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `customerLocale` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `lineItems` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `presentmentCurrency` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddress` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `shippingLines` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `sourceName` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `sourceUrl` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `subtotalPrice` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `taxLines` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `taxesIncluded` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `totalDiscounts` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `totalDuties` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `totalLineItemsPrice` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `totalPrice` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `totalTax` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `totalWeight` on the `Checkout` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Checkout" DROP COLUMN "customer",
DROP COLUMN "customerLocale",
DROP COLUMN "lineItems",
DROP COLUMN "name",
DROP COLUMN "presentmentCurrency",
DROP COLUMN "shippingAddress",
DROP COLUMN "shippingLines",
DROP COLUMN "source",
DROP COLUMN "sourceName",
DROP COLUMN "sourceUrl",
DROP COLUMN "subtotalPrice",
DROP COLUMN "taxLines",
DROP COLUMN "taxesIncluded",
DROP COLUMN "totalDiscounts",
DROP COLUMN "totalDuties",
DROP COLUMN "totalLineItemsPrice",
DROP COLUMN "totalPrice",
DROP COLUMN "totalTax",
DROP COLUMN "totalWeight";
