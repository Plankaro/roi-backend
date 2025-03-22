/*
  Warnings:

  - Added the required column `prospect_phone_no` to the `discount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "discount" ADD COLUMN     "prospect_phone_no" TEXT NOT NULL;
