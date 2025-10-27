// import fs from 'fs';
// import csv from 'csv-parser';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // ฟังก์ชันนำเข้าข้อมูลจังหวัด, อำเภอ และตำบล
// const importProvinces = async () => {
//   const provinces = [];
//   const districts = [];
//   const subdistricts = [];

//   // อ่านไฟล์ CSV ของจังหวัด
//   fs.createReadStream('./csv/thai_provinces.csv') // แก้ไข path ให้ตรงกับตำแหน่งไฟล์
//     .pipe(csv())
//     .on('data', async (row) => {
//       provinces.push({
//         id: parseInt(row.id),  // แปลงเป็น Integer
//         name_th: row.name_th,
//         name_en: row.name_en,
//       });

//       // ใช้ upsert เพื่อเพิ่มหรืออัพเดตข้อมูล
//       await prisma.province.upsert({
//         where: { id: parseInt(row.id) }, // ตรวจสอบว่า id มีอยู่แล้วหรือไม่
//         update: {
//           name_th: row.name_th,
//           name_en: row.name_en,
//         }, // ถ้ามีจะอัพเดตข้อมูล
//         create: {
//           id: parseInt(row.id),
//           name_th: row.name_th,
//           name_en: row.name_en,
//         }, // ถ้าไม่มีจะสร้างข้อมูลใหม่
//       });
//     })
//     .on('end', async () => {
//       console.log('Provinces imported!');

//       // อ่านไฟล์ CSV ของอำเภอ
//       fs.createReadStream('./csv/thai_amphures.csv') // แก้ไข path ให้ตรงกับตำแหน่งไฟล์
//         .pipe(csv())
//         .on('data', async (row) => {
//           districts.push({
//             id: parseInt(row.id),  // แปลงเป็น Integer
//             name_th: row.name_th,
//             name_en: row.name_en,
//             provinceId: parseInt(row.province_id), // เชื่อมโยงกับจังหวัด
//           });

//           // ใช้ upsert เพื่อเพิ่มหรืออัพเดตข้อมูลอำเภอ
//           await prisma.district.upsert({
//             where: { id: parseInt(row.id) },  // ตรวจสอบว่า id มีอยู่แล้วหรือไม่
//             update: {
//               name_th: row.name_th,
//               name_en: row.name_en,
//               provinceId: parseInt(row.province_id), // เชื่อมโยง province_id
//             },
//             create: {
//               id: parseInt(row.id),
//               name_th: row.name_th,
//               name_en: row.name_en,
//               provinceId: parseInt(row.province_id), // เชื่อมโยง province_id
//             },
//           });
//         })
//         .on('end', async () => {
//           console.log('Districts imported!');

//           // อ่านไฟล์ CSV ของตำบล
//           fs.createReadStream('./csv/thai_tambons.csv') // แก้ไข path ให้ตรงกับตำแหน่งไฟล์
//             .pipe(csv())
//             .on('data', async (row) => {
//               subdistricts.push({
//                 id: parseInt(row.id),  // แปลงเป็น Integer
//                 name_th: row.name_th,
//                 name_en: row.name_en,
//                 districtId: parseInt(row.amphure_id), // เชื่อมโยงกับอำเภอ
//               });

//               // ใช้ upsert เพื่อเพิ่มหรืออัพเดตข้อมูลตำบล
//               await prisma.subdistrict.upsert({
//                 where: { id: parseInt(row.id) },  // ตรวจสอบว่า id มีอยู่แล้วหรือไม่
//                 update: {
//                   name_th: row.name_th,
//                   name_en: row.name_en,
//                   districtId: parseInt(row.amphure_id), // เชื่อมโยง district_id
//                 },
//                 create: {
//                   id: parseInt(row.id),
//                   name_th: row.name_th,
//                   name_en: row.name_en,
//                   districtId: parseInt(row.amphure_id), // เชื่อมโยง district_id
//                 },
//               });
//             })
//             .on('end', async () => {
//               console.log('Subdistricts imported!');
//             });
//         });
//     });
// };

// importProvinces();

/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- helpers ----------
function readCsv(filePath, mapRow) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => rows.push(mapRow(row)))
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function insertInBatches(modelCreateMany, data, batchSize = 2000) {
  for (let i = 0; i < data.length; i += batchSize) {
    const chunk = data.slice(i, i + batchSize);
    if (chunk.length === 0) continue;
    await modelCreateMany({
      data: chunk,
      // ต้องมี unique/primary key จึงจะข้ามซ้ำได้ (เช่น id)
      skipDuplicates: true,
    });
  }
}

// ---------- main ----------
async function main() {
  const provincesPath    = path.resolve(__dirname, '../csv/thai_provinces.csv');
  const districtsPath    = path.resolve(__dirname, '../csv/thai_amphures.csv');
  const subdistrictsPath = path.resolve(__dirname, '../csv/thai_tambons.csv');

  console.time('read-csv');

  const [provinces, districtsRaw, subdistrictsRaw] = await Promise.all([
    readCsv(provincesPath, (r) => ({
      id: Number(r.id),
      name_th: r.name_th,
      name_en: r.name_en,
    })),
    readCsv(districtsPath, (r) => ({
      id: Number(r.id),
      name_th: r.name_th,
      name_en: r.name_en,
      provinceId: Number(r.province_id),
    })),
    readCsv(subdistrictsPath, (r) => ({
      id: Number(r.id),
      name_th: r.name_th,
      name_en: r.name_en,
      districtId: Number(r.amphure_id), // ใช้ amphure_id เป็น FK
      zipcode: r.zip_code,
    })),
  ]);

  console.timeEnd('read-csv');
  console.log(`Loaded: provinces=${provinces.length}, districts=${districtsRaw.length}, subdistricts=${subdistrictsRaw.length}`);

  // insert province
  await insertInBatches(prisma.province.createMany, provinces);

  // insert district
  await insertInBatches(prisma.district.createMany, districtsRaw);

  // ✅ โหลด district id ที่มีจริง แล้วกรอง subdistrict
  const existingDistricts = await prisma.district.findMany({ select: { id: true } });
  const districtIdSet = new Set(existingDistricts.map((d) => d.id));

  const subdistrictsOk = subdistrictsRaw.filter(
    (s) => Number.isInteger(s.id) && Number.isInteger(s.districtId) && districtIdSet.has(s.districtId)
  );

  const dropped = subdistrictsRaw.length - subdistrictsOk.length;
  if (dropped > 0) {
    console.warn(`⚠️ Dropped ${dropped} subdistrict rows due to missing/invalid districtId`);
  }

  // insert subdistrict (เฉพาะที่ FK ถูกต้อง)
  await insertInBatches(prisma.subdistrict.createMany, subdistrictsOk);

  console.log('✅ Seed done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
