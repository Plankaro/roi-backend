/*
  Warnings:

  - You are about to drop the column `template` on the `Broadcast` table. All the data in the column will be lost.
  - Added the required column `name` to the `Broadcast` table without a default value. This is not possible if the table is not empty.
  - Added the required column `template_id` to the `Broadcast` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Broadcast" DROP COLUMN "template",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "template_id" TEXT NOT NULL;
