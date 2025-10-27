/*
  Warnings:

  - You are about to drop the column `shelflife_unit_id` on the `ingredients` table. All the data in the column will be lost.
  - You are about to drop the `time_units` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `shelflife_unit_name` to the `ingredients` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ingredients" DROP CONSTRAINT "ingredients_shelflife_unit_id_fkey";

-- AlterTable
ALTER TABLE "ingredients" DROP COLUMN "shelflife_unit_id",
ADD COLUMN     "shelflife_unit_name" VARCHAR(50) NOT NULL;

-- DropTable
DROP TABLE "time_units";
