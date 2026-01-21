-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('SANDBOX', 'PRODUCTION');

-- CreateTable
CREATE TABLE "Merchant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "callback_url" TEXT NOT NULL,
    "webhook_username" TEXT NOT NULL,
    "webhook_password" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "client_version" INTEGER NOT NULL,
    "client_secret" TEXT NOT NULL,
    "merchant_id" TEXT NOT NULL,
    "environment" "Environment" NOT NULL,
    "created_by" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_client_id_key" ON "Merchant"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_client_secret_key" ON "Merchant"("client_secret");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_merchant_id_key" ON "Merchant"("merchant_id");

-- CreateIndex
CREATE INDEX "Merchant_merchant_id_idx" ON "Merchant"("merchant_id");

-- CreateIndex
CREATE INDEX "Merchant_client_id_idx" ON "Merchant"("client_id");
