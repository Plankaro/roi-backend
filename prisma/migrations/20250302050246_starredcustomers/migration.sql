-- CreateTable
CREATE TABLE "StarredCustomers" (
    "id" TEXT NOT NULL,
    "shopify_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StarredCustomers_pkey" PRIMARY KEY ("id")
);
