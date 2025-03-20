/*
  Warnings:

  - You are about to drop the column `deviceIdentifier` on the `Checkout` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `Checkout` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Checkout" DROP COLUMN "deviceIdentifier",
DROP COLUMN "userAgent";
