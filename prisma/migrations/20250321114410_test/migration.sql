-- DropForeignKey
ALTER TABLE "discount" DROP CONSTRAINT "discount_prospect_phone_fkey";

-- AlterTable
ALTER TABLE "discount" ALTER COLUMN "prospect_phone" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "discount" ADD CONSTRAINT "discount_prospect_phone_fkey" FOREIGN KEY ("prospect_phone") REFERENCES "Prospect"("phoneNo") ON DELETE SET NULL ON UPDATE CASCADE;
