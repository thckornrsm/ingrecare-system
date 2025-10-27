-- AlterTable
ALTER TABLE "store" ADD COLUMN     "districtId" INTEGER,
ADD COLUMN     "district_name_th" VARCHAR(100),
ADD COLUMN     "provinceId" INTEGER,
ADD COLUMN     "province_name_th" VARCHAR(100),
ADD COLUMN     "subdistrictId" INTEGER,
ADD COLUMN     "subdistrict_name_th" VARCHAR(100);

-- CreateIndex
CREATE INDEX "store_provinceId_idx" ON "store"("provinceId");

-- CreateIndex
CREATE INDEX "store_districtId_idx" ON "store"("districtId");

-- CreateIndex
CREATE INDEX "store_subdistrictId_idx" ON "store"("subdistrictId");

-- AddForeignKey
ALTER TABLE "store" ADD CONSTRAINT "store_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store" ADD CONSTRAINT "store_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store" ADD CONSTRAINT "store_subdistrictId_fkey" FOREIGN KEY ("subdistrictId") REFERENCES "Subdistrict"("id") ON DELETE SET NULL ON UPDATE CASCADE;
