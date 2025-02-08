/*
  Warnings:

  - Added the required column `price` to the `Broadcast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Broadcast" ADD COLUMN     "is_utm_id_embeded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" TEXT NOT NULL,
ADD COLUMN     "utm_campaign" TEXT,
ADD COLUMN     "utm_params" TEXT,
ADD COLUMN     "utm_source" TEXT,
ADD COLUMN     "utm_term" TEXT;
