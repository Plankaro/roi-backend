/*
  Warnings:

  - The values [Image,Video,Document,Text] on the enum `HeaderType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "HeaderType_new" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT', 'TEXT');
ALTER TABLE "Chat" ALTER COLUMN "header_type" TYPE "HeaderType_new" USING ("header_type"::text::"HeaderType_new");
ALTER TYPE "HeaderType" RENAME TO "HeaderType_old";
ALTER TYPE "HeaderType_new" RENAME TO "HeaderType";
DROP TYPE "HeaderType_old";
COMMIT;
