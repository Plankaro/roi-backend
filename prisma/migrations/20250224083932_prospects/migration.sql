/*
  Warnings:

  - A unique constraint covering the columns `[phoneNo]` on the table `Prospect` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Prospect_phoneNo_key" ON "Prospect"("phoneNo");
