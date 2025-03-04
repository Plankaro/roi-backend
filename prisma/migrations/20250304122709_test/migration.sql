-- DropForeignKey
ALTER TABLE "StarredCustomers" DROP CONSTRAINT "StarredCustomers_BuisnessId_fkey";

-- AddForeignKey
ALTER TABLE "StarredCustomers" ADD CONSTRAINT "StarredCustomers_BuisnessId_fkey" FOREIGN KEY ("BuisnessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
