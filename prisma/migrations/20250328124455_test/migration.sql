/*
  Warnings:

  - Added the required column `related_order_cancelled` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "related_order_cancelled" BOOLEAN NOT NULL;
