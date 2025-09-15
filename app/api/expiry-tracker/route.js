import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * @description ดึงข้อมูลวันหมดอายุของสินค้าที่ยังคงมีในสต็อก,
 * คำนวณวันหมดอายุแบบถอยหลัง และเรียงลำดับตามวันที่ใกล้หมดอายุก่อน
 * @param {Request} req
 * @returns {NextResponse}
 */
export async function GET(req) {
  try {
    // 1. ดึงข้อมูลวันหมดอายุของทุก batch ที่ยังไม่หมดอายุ และยังมีของในสต็อก
    const expiringItems = await prisma.expiry_tack.findMany({
      where: {
        // กรองเอาเฉพาะรายการที่ยังไม่หมดอายุ
        expiry_date: {
          gte: new Date(),
        },
        // และต้องเป็นวัตถุดิบที่ยังมียอดคงเหลือใน ingredient_now
        ingredient: {
          inventories: {
            some: {
              quantity: {
                gt: 0,
              },
            },
          },
        },
      },
      include: {
        ingredient: {
          select: {
            name: true,
            // ดึงยอดคงเหลือปัจจุบันมาด้วยเพื่อแสดงผล
            inventories: {
              select: {
                quantity: true,
                unit: {
                  select: { unit_name: true },
                },
              },
            },
          },
        },
      },
      orderBy: {
        expiry_date: 'asc', // เรียงตามวันที่ใกล้หมดอายุก่อนเสมอ
      },
    });

    // 2. คำนวณวันหมดอายุแบบถอยหลัง (Countdown) และจัดรูปแบบข้อมูล
    const now = new Date();
    const formattedResponse = expiringItems.map(item => {
      const expiryDate = new Date(item.expiry_date);
      
      // คำนวณความต่างของเวลา (หน่วยเป็น milliseconds)
      const timeDiff = expiryDate.getTime() - now.getTime();
      
      // แปลงเป็นจำนวนวัน (ปัดเศษขึ้นเสมอ)
      const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      // เนื่องจาก ingredient_now เก็บยอดรวม, เราจะดึงข้อมูลนั้นมาแสดง
      const currentInventory = item.ingredient.inventories[0];

      return {
        ingredient_id: item.ingredient_id,
        ingredient_name: item.ingredient.name,
        // แสดงยอดคงเหลือ "ทั้งหมด" ของวัตถุดิบนี้
        current_quantity: currentInventory ? currentInventory.quantity : 0,
        unit: currentInventory ? currentInventory.unit.unit_name : 'N/A',
        batch_id: item.batch_id,
        expiry_date: expiryDate.toLocaleString('th-TH', {
          timeZone: 'Asia/Bangkok',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        days_remaining: daysRemaining,
        status: getStatus(daysRemaining),
      };
    });

    return NextResponse.json(formattedResponse);

  } catch (error) {
    console.error('--- GET EXPIRY TRACKER ERROR ---', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลวันหมดอายุได้' },
      { status: 500 }
    );
  }
}

/**
 * ฟังก์ชันเสริมสำหรับกำหนดสถานะของสินค้าตามวันที่เหลือ
 * @param {number} daysRemaining
 * @returns {string} Status text
 */
function getStatus(daysRemaining) {
  if (daysRemaining <= 0) return 'หมดอายุแล้ว';
  if (daysRemaining <= 3) return 'ใกล้หมดอายุ';
  if (daysRemaining <= 7) return 'ควรใช้เร็วๆ นี้';
  return 'ปกติ';
}
