/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Fulfillment` table. All the data in the column will be lost.
  - You are about to drop the column `shopifyId` on the `Fulfillment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Fulfillment` table. All the data in the column will be lost.
  - Added the required column `adminGraphqlApiId` to the `Fulfillment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_at` to the `Fulfillment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lineItems` to the `Fulfillment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Fulfillment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service` to the `Fulfillment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopify_id` to the `Fulfillment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Fulfillment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Fulfillment_shopifyId_key";

-- AlterTable
ALTER TABLE "Fulfillment" DROP COLUMN "createdAt",
DROP COLUMN "shopifyId",
DROP COLUMN "updatedAt",
ADD COLUMN     "adminGraphqlApiId" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "destination" JSONB,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "lineItems" JSONB NOT NULL,
ADD COLUMN     "locationId" BIGINT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "originAddress" JSONB,
ADD COLUMN     "receipt" JSONB,
ADD COLUMN     "service" TEXT NOT NULL,
ADD COLUMN     "shipmentStatus" TEXT,
ADD COLUMN     "shopify_id" TEXT NOT NULL,
ADD COLUMN     "trackingNumbers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "trackingUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
