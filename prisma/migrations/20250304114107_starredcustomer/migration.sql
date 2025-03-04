/*
  Warnings:

  - You are about to drop the column `BroadCastId` on the `StarredCustomers` table. All the data in the column will be lost.
  - Added the required column `BuisnessId` to the `StarredCustomers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StarredCustomers" DROP CONSTRAINT "StarredCustomers_BroadCastId_fkey";

-- AlterTable
ALTER TABLE "StarredCustomers" DROP COLUMN "BroadCastId",
ADD COLUMN     "BuisnessId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "StarredCustomers" ADD CONSTRAINT "StarredCustomers_BuisnessId_fkey" FOREIGN KEY ("BuisnessId") REFERENCES "Broadcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
