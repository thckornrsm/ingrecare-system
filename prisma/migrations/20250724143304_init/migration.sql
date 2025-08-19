/*
  Warnings:

  - You are about to drop the column `user_id` on the `history` table. All the data in the column will be lost.
  - Added the required column `store_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "history" DROP CONSTRAINT "history_user_id_fkey";

-- AlterTable
ALTER TABLE "history" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "store_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "store" (
    "store_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_pkey" PRIMARY KEY ("store_id")
);

-- CreateTable
CREATE TABLE "batch" (
    "batch_id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER NOT NULL,
    "description" VARCHAR(255),

    CONSTRAINT "batch_pkey" PRIMARY KEY ("batch_id")
);

-- CreateTable
CREATE TABLE "_historyTouser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_historyTouser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_email_key" ON "store"("email");

-- CreateIndex
CREATE INDEX "_historyTouser_B_index" ON "_historyTouser"("B");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "store"("store_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch" ADD CONSTRAINT "batch_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockin" ADD CONSTRAINT "stockin_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockout" ADD CONSTRAINT "stockout_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_now" ADD CONSTRAINT "ingredient_now_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("batch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expiry_tack" ADD CONSTRAINT "expiry_tack_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batch"("batch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_historyTouser" ADD CONSTRAINT "_historyTouser_A_fkey" FOREIGN KEY ("A") REFERENCES "history"("history_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_historyTouser" ADD CONSTRAINT "_historyTouser_B_fkey" FOREIGN KEY ("B") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
