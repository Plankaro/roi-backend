/*
  Warnings:

  - You are about to drop the column `mobile_no` on the `Checkout` table. All the data in the column will be lost.
  - Added the required column `domain` to the `Checkout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Checkout" DROP COLUMN "mobile_no",
ADD COLUMN     "domain" TEXT NOT NULL;
