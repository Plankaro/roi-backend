-- AlterTable
ALTER TABLE "Checkout" ALTER COLUMN "abandonedCheckoutUrl" DROP NOT NULL,
ALTER COLUMN "customerLocale" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "presentmentCurrency" DROP NOT NULL,
ALTER COLUMN "totalLineItemsPrice" DROP NOT NULL,
ALTER COLUMN "totalTax" DROP NOT NULL;
