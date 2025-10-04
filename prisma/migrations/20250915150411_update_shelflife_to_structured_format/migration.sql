/*
  Warnings:

  - You are about to drop the column `shelflife_day` on the `ingredients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ingredients" DROP COLUMN "shelflife_day",
ADD COLUMN     "shelflife_unit_id" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "shelflife_value" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "time_units" (
    "unit_id" SERIAL NOT NULL,
    "unit_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "time_units_pkey" PRIMARY KEY ("unit_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "time_units_unit_name_key" ON "time_units"("unit_name");

-- AddForeignKey
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_shelflife_unit_id_fkey" FOREIGN KEY ("shelflife_unit_id") REFERENCES "time_units"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;
