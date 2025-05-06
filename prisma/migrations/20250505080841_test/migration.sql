/*
  Warnings:

  - The primary key for the `CheckoutOnCampaign` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrderCampaign` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The required column `id` was added to the `CheckoutOnCampaign` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `OrderCampaign` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "CheckoutOnCampaign" DROP CONSTRAINT "CheckoutOnCampaign_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "CheckoutOnCampaign_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "OrderCampaign" DROP CONSTRAINT "OrderCampaign_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "OrderCampaign_pkey" PRIMARY KEY ("id");
