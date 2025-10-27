import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const whereClause = categoryId ? { category_id: parseInt(categoryId, 10) } : {};

    // ✅ ลบ shelflife_unit ออกจาก include
    const ingredients = await prisma.ingredients.findMany({
      where: whereClause,
      include: {
        category: { select: { category_name: true } },
        unit: { select: { unit_name: true } },
        // ❌ ลบบรรทัดนี้ออก
        // shelflife_unit: { select: { unit_name: true } },
      },
      orderBy: { ingredient_id: 'asc' },
    });

    // 2) ดึงคงเหลือตามล็อตเพื่อคำนวณหมดอายุ
    const lots = await prisma.ingredient_now.findMany({
      where: { quantity: { gt: 0 } },
      include: {
        batch: { include: { expiry: true } }, // expiry_tack[]
        ingredient: true,
      },
    });

    const byIngredient = new Map(); // ingredient_id -> { totalNonExpired, soonestExpiry }
    const now = new Date();

    for (const l of lots) {
      const expRow = l.batch.expiry.find((e) => e.ingredient_id === l.ingredient_id);
      const exp = expRow ? expRow.expiry_date : null;

      // นโยบายความปลอดภัยอาหาร: ถ้าไม่มีวันหมดอายุ -> ถือว่าหมดอายุ
      const expired = exp ? endOfDay(exp) < now : true;

      if (!expired) {
        const current = byIngredient.get(l.ingredient_id) || { totalNonExpired: 0, soonestExpiry: null };
        current.totalNonExpired += Number(l.quantity);
        if (!current.soonestExpiry || (exp && exp < current.soonestExpiry)) {
          current.soonestExpiry = exp;
        }
        byIngredient.set(l.ingredient_id, current);
      }
    }

    // 3) ผนวกสถานะลงผลลัพธ์
    const result = ingredients.map((ing) => {
      const agg = byIngredient.get(ing.ingredient_id);
      const total_nonexpired_qty = agg?.totalNonExpired ?? 0;
      const is_expired = total_nonexpired_qty <= 0;
      const soonest_expiry_date = agg?.soonestExpiry ? agg.soonestExpiry.toISOString() : null;
      return {
        ...ing,
        is_expired,
        total_nonexpired_qty,
        soonest_expiry_date,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('INGREDIENTS_FETCH_ERROR', error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลวัตถุดิบได้' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // ✅ เปลี่ยนจาก shelflife_unit_id เป็น shelflife_unit_name
    const { name, category_id, unit_id, shelflife_value, shelflife_unit_name } = await req.json();

    if (!name || !category_id || !unit_id || shelflife_value === undefined || !shelflife_unit_name) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบ: name, category_id, unit_id, shelflife_value, shelflife_unit_name' },
        { status: 400 }
      );
    }

    const newIngredient = await prisma.ingredients.create({
      data: {
        name,
        category_id: parseInt(category_id, 10),
        unit_id: parseInt(unit_id, 10),
        shelflife_value: parseInt(shelflife_value, 10),
        shelflife_unit_name: shelflife_unit_name, // ✅ ใช้ string แทน FK
      },
    });

    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error) {
    console.error('INGREDIENTS_CREATE_ERROR', error);
    return NextResponse.json({ error: 'ไม่สามารถสร้างวัตถุดิบได้' }, { status: 500 });
  }
}