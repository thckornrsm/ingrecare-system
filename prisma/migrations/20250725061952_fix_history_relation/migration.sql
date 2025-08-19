/*
  Warnings:

  - You are about to drop the `_historyTouser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `history` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_historyTouser" DROP CONSTRAINT "_historyTouser_A_fkey";

-- DropForeignKey
ALTER TABLE "_historyTouser" DROP CONSTRAINT "_historyTouser_B_fkey";

-- AlterTable
ALTER TABLE "history" ADD COLUMN     "user_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_historyTouser";

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
