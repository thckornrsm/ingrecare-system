import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ป้องกันการ Caching ข้อมูลเก่า
export const dynamic = 'force-dynamic';

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month'), 10);
    const year = parseInt(searchParams.get('year'), 10);

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const stockIns = await prisma.stockin.findMany({
      where: { received_date: { gte: startDate, lte: endDate } },
      include: { ingredient: { include: { category: true, unit: true } } },
      orderBy: { received_date: 'desc' }
    });

    const stockOuts = await prisma.stockout.findMany({
      where: { out_date: { gte: startDate, lte: endDate } },
      include: { ingredient: { include: { category: true, unit: true } } },
      orderBy: { out_date: 'desc' }
    });
    
    // --- 1. คำนวณ Summary ---
    const importTotal = stockIns.reduce((sum, item) => sum + item.quantity, 0);
    const dispenseTotal = stockOuts.reduce((sum, item) => sum + item.quantity, 0);
    const currentStock = await prisma.ingredient_now.aggregate({ _sum: { quantity: true } });
    const stockTotal = currentStock._sum.quantity || 0;

    // --- 2. คำนวณ Donut Chart ---
    const categoryDispense = stockOuts.reduce((acc, item) => {
      const category = item.ingredient.category.category_name;
      acc[category] = (acc[category] || 0) + item.quantity;
      return acc;
    }, {});
    const donutData = Object.entries(categoryDispense).map(([name, value]) => ({
        name,
        value: dispenseTotal > 0 ? (value / dispenseTotal) * 100 : 0,
    }));

    // --- 3. คำนวณ Bar Chart ---
    const barData = stockOuts.reduce((acc, item) => {
      const category = item.ingredient.category.category_name;
      const ingredient = item.ingredient.name;
      if (!acc[category]) acc[category] = {};
      acc[category][ingredient] = (acc[category][ingredient] || 0) + item.quantity;
      return acc;
    }, {});
    const formattedBarData = Object.keys(barData).reduce((acc, category) => {
      acc[category] = Object.entries(barData[category]).map(([name, value]) => ({ name, value }));
      return acc;
    }, {});

    // --- 4. คำนวณ Trend Chart (กราฟเส้น) ---
    const daysInMonth = getDaysInMonth(year, month);
    const trendData = Array.from({ length: daysInMonth }, (_, i) => ({
      date: `${i + 1} ${startDate.toLocaleString('th-TH', { month: 'short' })}`,
      'นำเข้า': 0, 'เบิกจ่าย': 0,
    }));
    stockIns.forEach(item => {
      const day = new Date(item.received_date).getDate();
      if (trendData[day - 1]) trendData[day - 1]['นำเข้า'] += item.quantity;
    });
    stockOuts.forEach(item => {
      const day = new Date(item.out_date).getDate();
      if (trendData[day - 1]) trendData[day - 1]['เบิกจ่าย'] += item.quantity;
    });

    // --- 5. จัดรูปแบบ History ---
    const historyStockIn = stockIns.map(item => ({
        id: item.stockin_id, date: item.received_date, ingredientName: item.ingredient.name,
        categoryName: item.ingredient.category.category_name, quantity: item.quantity,
        unitName: item.ingredient.unit.unit_name
    }));
    const historyStockOut = stockOuts.map(item => ({
        id: item.stockout_id, date: item.out_date, ingredientName: item.ingredient.name,
        categoryName: item.ingredient.category.category_name, quantity: item.quantity,
        unitName: item.ingredient.unit.unit_name
    }));

    // --- 6. ประกอบข้อมูลทั้งหมด ---
    const responseData = {
      summary: {
        importTotal: parseFloat(importTotal.toFixed(2)),
        dispenseTotal: parseFloat(dispenseTotal.toFixed(2)),
        stockTotal: parseFloat(stockTotal.toFixed(2)),
      },
      donut: donutData,
      bar: formattedBarData,
      trend: trendData,
      historyStockIn,
      historyStockOut,
    };

    return NextResponse.json(responseData);

  } catch (e) {
    console.error('STATISTICS_ERROR', e);
    return NextResponse.json({ error: 'ไม่สามารถประมวลผลข้อมูลสถิติได้' }, { status: 500 });
  }
}