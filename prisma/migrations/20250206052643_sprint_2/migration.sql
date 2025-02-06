-- DropForeignKey
ALTER TABLE "FlashResponse" DROP CONSTRAINT "FlashResponse_createdBy_fkey";

-- AlterTable
ALTER TABLE "FlashResponse" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "createdForId" DROP NOT NULL,
ALTER COLUMN "createdBy" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "FlashResponse" ADD CONSTRAINT "FlashResponse_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
