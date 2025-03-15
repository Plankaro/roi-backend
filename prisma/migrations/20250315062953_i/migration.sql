/*
  Warnings:

  - The values [TRANSACTIONAL] on the enum `TemplateCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `content` on the `Template` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TemplateCategory_new" AS ENUM ('AUTHENTICATION', 'MARKETING', 'UTILITY');
ALTER TABLE "Template" ALTER COLUMN "category" TYPE "TemplateCategory_new" USING ("category"::text::"TemplateCategory_new");
ALTER TYPE "TemplateCategory" RENAME TO "TemplateCategory_old";
ALTER TYPE "TemplateCategory_new" RENAME TO "TemplateCategory";
DROP TYPE "TemplateCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "Template" DROP COLUMN "content";
