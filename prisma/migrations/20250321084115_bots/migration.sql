-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "botName" TEXT,
ADD COLUMN     "isAutomated" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "discount" (
    "id" TEXT NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "discount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discount_shopifyId_key" ON "discount"("shopifyId");
