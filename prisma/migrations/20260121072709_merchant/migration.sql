/*
  Warnings:

  - You are about to drop the `Merchant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Merchant";

-- CreateTable
CREATE TABLE "merchant" (
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

    CONSTRAINT "merchant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "merchant_client_id_key" ON "merchant"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_client_secret_key" ON "merchant"("client_secret");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_merchant_id_key" ON "merchant"("merchant_id");

-- CreateIndex
CREATE INDEX "merchant_merchant_id_idx" ON "merchant"("merchant_id");

-- CreateIndex
CREATE INDEX "merchant_client_id_idx" ON "merchant"("client_id");
