-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "shopify_id" TEXT NOT NULL,
    "prospect_shopify_id" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_shopify_id_key" ON "Order"("shopify_id");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_prospect_shopify_id_fkey" FOREIGN KEY ("prospect_shopify_id") REFERENCES "Prospect"("shopify_id") ON DELETE RESTRICT ON UPDATE CASCADE;
