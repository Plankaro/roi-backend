/*
  Warnings:

  - You are about to drop the column `message` on the `Template` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Template` table. All the data in the column will be lost.
  - Added the required column `category` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Added the required column `languageCode` to the `Template` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Template` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('TRANSACTIONAL', 'MARKETING', 'UTILITY');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "message",
DROP COLUMN "type",
ADD COLUMN     "category" "TemplateCategory" NOT NULL,
ADD COLUMN     "component" JSONB,
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "languageCode" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "TemplateStatus" NOT NULL;
