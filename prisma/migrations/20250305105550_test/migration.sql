/*
  Warnings:

  - You are about to drop the column `short` on the `FlashResponse` table. All the data in the column will be lost.
  - Added the required column `category` to the `FlashResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heading` to the `FlashResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FlashResponse" DROP COLUMN "short",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "heading" TEXT NOT NULL;
