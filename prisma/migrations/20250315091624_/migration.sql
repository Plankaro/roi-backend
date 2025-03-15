/*
  Warnings:

  - A unique constraint covering the columns `[whatsapp_id]` on the table `Template` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `whatsapp_id` to the `Template` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "whatsapp_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Template_whatsapp_id_key" ON "Template"("whatsapp_id");
