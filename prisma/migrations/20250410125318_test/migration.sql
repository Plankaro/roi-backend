-- CreateEnum
CREATE TYPE "BotType" AS ENUM ('WELCOME', 'PRODUCT_BROWSING', 'ORDER_CANCEL', 'SHIPPING_CHARGES', 'REPEAT_ORDER', 'DISCOUNT');

-- CreateTable
CREATE TABLE "Bots" (
    "id" TEXT NOT NULL,
    "type" "BotType" NOT NULL,
    "discount_type" "discount_type" NOT NULL,
    "buisness_id" TEXT NOT NULL,
    "discount_amount" INTEGER NOT NULL,
    "discount_days" INTEGER NOT NULL,
    "discount_minimum" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "shipping_standard_cost" INTEGER NOT NULL,
    "shipping_threshold" INTEGER NOT NULL,
    "international_shipping_cost" INTEGER NOT NULL,

    CONSTRAINT "Bots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bots" ADD CONSTRAINT "Bots_buisness_id_fkey" FOREIGN KEY ("buisness_id") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
