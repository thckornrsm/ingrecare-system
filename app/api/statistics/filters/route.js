// /app/api/statistics/filters/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const formatDateToThaiMonthYear = (date) => {
  const year = date.getFullYear() + 543;
  const month = date.toLocaleString('th-TH', { month: 'long' });
  return `${month} ${year}`;
};

export async function GET() {
  try {
    // ----- เดือนจาก stock-in / stock-out -----
    const [stockInMonths, stockOutMonths] = await Promise.all([
      prisma.stockin.findMany({
        select: { received_date: true },
        distinct: ['received_date'],
      }),
      prisma.stockout.findMany({
        select: { out_date: true },
        distinct: ['out_date'],
      }),
    ]);

    const allDates = [
      ...stockInMonths.map((item) => item.received_date),
      ...stockOutMonths.map((item) => item.out_date),
    ].filter(Boolean);

    const uniqueMonths = [
      ...new Set(allDates.map((date) => formatDateToThaiMonthYear(new Date(date)))),
    ];

    // ----- หน่วยนับที่มีอยู่จริงในสต็อกปัจจุบัน (ingredient_now) -----
    // ใช้ distinct ที่ unit_id และดึงชื่อหน่วยจาก relation unit
    const invUnits = await prisma.ingredient_now.findMany({
      select: { unit_id: true, unit: { select: { unit_name: true } } },
      distinct: ['unit_id'],
    });

    const uniqueUnitNames = [...new Set(invUnits.map((u) => u.unit?.unit_name).filter(Boolean))];

    return NextResponse.json({
      availableMonths: uniqueMonths.map((m) => ({ name: m })),
      availableUnits: uniqueUnitNames.map((u) => ({ name: u })),
    });
  } catch (e) {
    console.error('FILTERS_API_ERROR', e);
    return NextResponse.json(
      { error: 'ไม่สามารถโหลดข้อมูลตัวกรองเดือนได้' },
      { status: 500 }
    );
  }
}
