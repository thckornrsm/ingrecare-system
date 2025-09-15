import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * @description ดึงข้อมูลประวัติธุรกรรมทั้งหมด (Stock-in และ Stock-out) และเรียงตามเวลา
 * @param {Request} req
 * @returns {NextResponse}
 */
export async function GET(req) {
  try {
    // 1. ดึงข้อมูลประวัติทั้งหมด พร้อมข้อมูลที่เกี่ยวข้อง
    const historyItems = await prisma.history.findMany({
      include: {
        user: {
          select: { name: true },
        },
        stockin: {
          include: {
            ingredient: { select: { name: true } },
            unit: { select: { unit_name: true } },
          },
        },
        stockout: {
          include: {
            ingredient: { select: { name: true } },
            unit: { select: { unit_name: true } },
          },
        },
      },
    });

    // 2. แปลงข้อมูลให้อยู่ในรูปแบบเดียวกันที่ง่ายต่อการใช้งาน
    const formattedHistory = historyItems.map(item => {
      if (item.stockin) {
        return {
          type: 'Stock-in',
          date: item.stockin.received_date,
          user: item.user.name,
          ingredient: item.stockin.ingredient.name,
          quantity: item.stockin.quantity,
          unit: item.stockin.unit.unit_name,
          description: `รับเข้า: ${item.stockin.quantity} ${item.stockin.unit.unit_name}`,
        };
      }
      if (item.stockout) {
        return {
          type: 'Stock-out',
          date: item.stockout.out_date,
          user: item.user.name,
          ingredient: item.stockout.ingredient.name,
          quantity: -item.stockout.quantity, // ทำให้เป็นค่าลบเพื่อแยกแยะในกราฟ
          unit: item.stockout.unit.unit_name,
          description: `เบิกออก: ${item.stockout.quantity} ${item.stockout.unit.unit_name}`,
        };
      }
      return null; // กรณีข้อมูลไม่สมบูรณ์
    }).filter(item => item !== null); // กรองรายการที่ข้อมูลไม่สมบูรณ์ออก

    // 3. เรียงลำดับข้อมูลทั้งหมดตามวันที่ล่าสุดก่อน
    formattedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 4. แปลงเวลาให้เป็นรูปแบบของประเทศไทยเพื่อการแสดงผล
    const localizedHistory = formattedHistory.map(item => ({
      ...item,
      date: new Date(item.date).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    }));

    return NextResponse.json(localizedHistory);

  } catch (error) {
    console.error('--- GET HISTORY ERROR ---', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลประวัติได้' },
      { status: 500 }
    );
  }
}
