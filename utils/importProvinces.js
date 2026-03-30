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
// 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanValue(value) {
  if (typeof value !== 'string') return value;
  return value.trim();
}

function cleanRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k.trim(), cleanValue(v)])
  );
}

function toInt(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : null;
}

function readCsv(filePath, mapRow) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const cleaned = cleanRow(row);
          rows.push(mapRow(cleaned));
        } catch (error) {
          reject(error);
        }
      })
      .on('end', () => resolve(rows))
      .on('error', reject);
  });
}

async function insertInBatches(modelCreateMany, data, batchSize = 2000) {
  for (let i = 0; i < data.length; i += batchSize) {
    const chunk = data.slice(i, i + batchSize);
    if (!chunk.length) continue;

    await modelCreateMany({
      data: chunk,
      skipDuplicates: true,
    });
  }
}

async function main() {
  const provincesPath = path.resolve(__dirname, '../csv/thai_provinces.csv');
  const districtsPath = path.resolve(__dirname, '../csv/thai_amphures.csv');
  const subdistrictsPath = path.resolve(__dirname, '../csv/thai_tambons.csv');

  console.time('read-csv');

  const [provincesRaw, districtsRaw, subdistrictsRaw] = await Promise.all([
    readCsv(provincesPath, (r) => ({
      id: toInt(r.id),
      name_th: r.name_th || null,
      name_en: r.name_en || null,
    })),
    readCsv(districtsPath, (r) => ({
      id: toInt(r.id),
      name_th: r.name_th || null,
      name_en: r.name_en || null,
      provinceId: toInt(r.provinceId),
    })),
    readCsv(subdistrictsPath, (r) => ({
      id: toInt(r.id),
      name_th: r.name_th || null,
      name_en: r.name_en || null,
      districtId: toInt(r.districtId),
      zipcode: r.zipcode || null,
    })),
  ]);

  console.timeEnd('read-csv');

  const provinces = provincesRaw.filter(
    (p) =>
      Number.isInteger(p.id) &&
      p.name_th &&
      p.name_en
  );

  await insertInBatches(prisma.province.createMany, provinces);

  const existingProvinces = await prisma.province.findMany({
    select: { id: true },
  });
  const provinceIdSet = new Set(existingProvinces.map((p) => p.id));

  const districts = districtsRaw.filter(
    (d) =>
      Number.isInteger(d.id) &&
      d.name_th &&
      d.name_en &&
      Number.isInteger(d.provinceId) &&
      provinceIdSet.has(d.provinceId)
  );

  const droppedDistricts = districtsRaw.length - districts.length;
  if (droppedDistricts > 0) {
    console.warn(`⚠️ Dropped ${droppedDistricts} invalid district rows`);
    console.log(
      districtsRaw.filter(
        (d) =>
          !Number.isInteger(d.id) ||
          !d.name_th ||
          !d.name_en ||
          !Number.isInteger(d.provinceId) ||
          !provinceIdSet.has(d.provinceId)
      ).slice(0, 10)
    );
  }

  await insertInBatches(prisma.district.createMany, districts);

  const existingDistricts = await prisma.district.findMany({
    select: { id: true },
  });
  const districtIdSet = new Set(existingDistricts.map((d) => d.id));

  const subdistricts = subdistrictsRaw.filter(
    (s) =>
      Number.isInteger(s.id) &&
      s.name_th &&
      s.name_en &&
      Number.isInteger(s.districtId) &&
      districtIdSet.has(s.districtId)
  );

  const droppedSubdistricts = subdistrictsRaw.length - subdistricts.length;
  if (droppedSubdistricts > 0) {
    console.warn(`⚠️ Dropped ${droppedSubdistricts} invalid subdistrict rows`);
    console.log(
      subdistrictsRaw.filter(
        (s) =>
          !Number.isInteger(s.id) ||
          !s.name_th ||
          !s.name_en ||
          !Number.isInteger(s.districtId) ||
          !districtIdSet.has(s.districtId)
      ).slice(0, 10)
    );
  }

  await insertInBatches(prisma.subdistrict.createMany, subdistricts);

  console.log('✅ Seed done.');
  console.log(
    `Inserted: provinces=${provinces.length}, districts=${districts.length}, subdistricts=${subdistricts.length}`
  );
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });