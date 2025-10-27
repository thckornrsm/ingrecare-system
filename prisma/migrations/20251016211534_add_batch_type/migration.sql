-- CreateEnum
CREATE TYPE "BatchType" AS ENUM ('STOCK_IN', 'STOCK_OUT');

-- AlterTable
ALTER TABLE "batch" ADD COLUMN     "type" "BatchType" NOT NULL DEFAULT 'STOCK_IN';
