/*
  Warnings:

  - You are about to drop the column `template_id` on the `Broadcast` table. All the data in the column will be lost.
  - Added the required column `template_language` to the `Broadcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_name` to the `Broadcast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Broadcast" DROP COLUMN "template_id",
ADD COLUMN     "template_language" TEXT NOT NULL,
ADD COLUMN     "template_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "template_components" JSONB;
