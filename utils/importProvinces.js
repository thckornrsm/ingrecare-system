import fs from 'fs';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ฟังก์ชันนำเข้าข้อมูลจังหวัด, อำเภอ และตำบล
const importProvinces = async () => {
  const provinces = [];
  const districts = [];
  const subdistricts = [];

  // อ่านไฟล์ CSV ของจังหวัด
  fs.createReadStream('./csv/thai_provinces.csv') // แก้ไข path ให้ตรงกับตำแหน่งไฟล์
    .pipe(csv())
    .on('data', async (row) => {
      provinces.push({
        id: parseInt(row.id),  // แปลงเป็น Integer
        name_th: row.name_th,
        name_en: row.name_en,
      });

      // ใช้ upsert เพื่อเพิ่มหรืออัพเดตข้อมูล
      await prisma.province.upsert({
        where: { id: parseInt(row.id) }, // ตรวจสอบว่า id มีอยู่แล้วหรือไม่
        update: {
          name_th: row.name_th,
          name_en: row.name_en,
        }, // ถ้ามีจะอัพเดตข้อมูล
        create: {
          id: parseInt(row.id),
          name_th: row.name_th,
          name_en: row.name_en,
        }, // ถ้าไม่มีจะสร้างข้อมูลใหม่
      });
    })
    .on('end', async () => {
      console.log('Provinces imported!');

      // อ่านไฟล์ CSV ของอำเภอ
      fs.createReadStream('./csv/thai_amphures.csv') // แก้ไข path ให้ตรงกับตำแหน่งไฟล์
        .pipe(csv())
        .on('data', async (row) => {
          districts.push({
            id: parseInt(row.id),  // แปลงเป็น Integer
            name_th: row.name_th,
            name_en: row.name_en,
            provinceId: parseInt(row.province_id), // เชื่อมโยงกับจังหวัด
          });

          // ใช้ upsert เพื่อเพิ่มหรืออัพเดตข้อมูลอำเภอ
          await prisma.district.upsert({
            where: { id: parseInt(row.id) },  // ตรวจสอบว่า id มีอยู่แล้วหรือไม่
            update: {
              name_th: row.name_th,
              name_en: row.name_en,
              provinceId: parseInt(row.province_id), // เชื่อมโยง province_id
            },
            create: {
              id: parseInt(row.id),
              name_th: row.name_th,
              name_en: row.name_en,
              provinceId: parseInt(row.province_id), // เชื่อมโยง province_id
            },
          });
        })
        .on('end', async () => {
          console.log('Districts imported!');

          // อ่านไฟล์ CSV ของตำบล
          fs.createReadStream('./csv/thai_tambons.csv') // แก้ไข path ให้ตรงกับตำแหน่งไฟล์
            .pipe(csv())
            .on('data', async (row) => {
              subdistricts.push({
                id: parseInt(row.id),  // แปลงเป็น Integer
                name_th: row.name_th,
                name_en: row.name_en,
                districtId: parseInt(row.amphure_id), // เชื่อมโยงกับอำเภอ
              });

              // ใช้ upsert เพื่อเพิ่มหรืออัพเดตข้อมูลตำบล
              await prisma.subdistrict.upsert({
                where: { id: parseInt(row.id) },  // ตรวจสอบว่า id มีอยู่แล้วหรือไม่
                update: {
                  name_th: row.name_th,
                  name_en: row.name_en,
                  districtId: parseInt(row.amphure_id), // เชื่อมโยง district_id
                },
                create: {
                  id: parseInt(row.id),
                  name_th: row.name_th,
                  name_en: row.name_en,
                  districtId: parseInt(row.amphure_id), // เชื่อมโยง district_id
                },
              });
            })
            .on('end', async () => {
              console.log('Subdistricts imported!');
            });
        });
    });
};

importProvinces();
