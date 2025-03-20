/*
  Warnings:

  - You are about to drop the column `paymentGatewayId` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddress` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `sourceUrl` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Checkout` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_checkout_id_fkey";

-- AlterTable
ALTER TABLE "Checkout" DROP COLUMN "paymentGatewayId",
DROP COLUMN "shippingAddress",
DROP COLUMN "sourceUrl",
DROP COLUMN "userId",
ADD COLUMN     "discount_codes" TEXT[];
