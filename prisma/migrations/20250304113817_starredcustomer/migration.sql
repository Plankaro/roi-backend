/*
  Warnings:

  - Added the required column `BroadCastId` to the `StarredCustomers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StarredCustomers" ADD COLUMN     "BroadCastId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "StarredCustomers" ADD CONSTRAINT "StarredCustomers_BroadCastId_fkey" FOREIGN KEY ("BroadCastId") REFERENCES "Broadcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
