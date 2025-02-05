/*
  Warnings:

  - You are about to drop the column `body_attachmentUrl` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `body_type` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `footer_type` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `footer_url` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `header_url` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "HeaderType" ADD VALUE 'Text';

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "body_attachmentUrl",
DROP COLUMN "body_type",
DROP COLUMN "footer_type",
DROP COLUMN "footer_url",
DROP COLUMN "header_url",
ADD COLUMN     "Buttons" TEXT[],
ADD COLUMN     "header_value" TEXT;
