-- CreateEnum
CREATE TYPE "SubscriptionPlanType" AS ENUM ('TRIAL', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- AlterTable
ALTER TABLE "merchant" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_send" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "subscription_plans" (
    "id" SERIAL NOT NULL,
    "merchant_id" INTEGER NOT NULL,
    "plan_name" VARCHAR(100) NOT NULL,
    "plan_type" "SubscriptionPlanType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "billing_cycle_months" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_send" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subscription_plans_merchant_id_idx" ON "subscription_plans"("merchant_id");

-- AddForeignKey
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
