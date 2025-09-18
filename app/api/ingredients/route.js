import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: ดึงข้อมูลวัตถุดิบทั้งหมด (ปรับปรุงให้ดึงหน่วยเวลามาด้วย)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    const whereClause = categoryId ? { category_id: parseInt(categoryId, 10) } : {};

    const ingredients = await prisma.ingredients.findMany({
      where: whereClause,
      include: {
        category: {
          select: { category_name: true },
        },
        unit: {
          select: { unit_name: true },
        },
        // --- เพิ่มส่วนนี้เข้ามา ---
        shelflife_unit: {
            select: { unit_name: true }, // ดึงชื่อหน่วยเวลามาด้วย
        }
      },
      orderBy: {
        ingredient_id: 'asc',
      },
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("INGREDIENTS_FETCH_ERROR", error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลวัตถุดิบได้' },
      { status: 500 }
    );
  }
}

// POST: สร้างวัตถุดิบใหม่ (ปรับปรุงให้รับข้อมูล shelflife แบบใหม่)
export async function POST(req) {
  try {
    // --- แก้ไข: รับ shelflife_value และ shelflife_unit_id แทน shelflife_day ---
    const { name, category_id, unit_id, shelflife_value, shelflife_unit_id } = await req.json();

    if (!name || !category_id || !unit_id || shelflife_value === undefined || !shelflife_unit_id) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบ: name, category_id, unit_id, shelflife_value, shelflife_unit_id' },
        { status: 400 }
      );
    }

    const newIngredient = await prisma.ingredients.create({
      data: {
        name,
        category_id: parseInt(category_id, 10),
        unit_id: parseInt(unit_id, 10),
        // --- แก้ไข: บันทึกข้อมูล shelflife แบบใหม่ ---
        shelflife_value: parseInt(shelflife_value, 10),
        shelflife_unit_id: parseInt(shelflife_unit_id, 10),
      },
    });

    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error) {
    console.error("INGREDIENTS_CREATE_ERROR", error);
    return NextResponse.json(
      { error: 'ไม่สามารถสร้างวัตถุดิบได้' },
      { status: 500 }
    );
  }
}

// PUT: อัปเดตข้อมูลวัตถุดิบ (ปรับปรุงให้รับข้อมูล shelflife แบบใหม่)
export async function PUT(req) {
  try {
    // --- แก้ไข: รับ shelflife_value และ shelflife_unit_id แทน shelflife_day ---
    const { ingredient_id, name, category_id, unit_id, shelflife_value, shelflife_unit_id } = await req.json();

    if (!ingredient_id) {
        return NextResponse.json({ error: 'กรุณาระบุ ingredient_id' }, { status: 400 });
    }

    const updatedIngredient = await prisma.ingredients.update({
      where: {
        ingredient_id: parseInt(ingredient_id, 10),
      },
      data: {
        name,
        category_id: category_id ? parseInt(category_id, 10) : undefined,
        unit_id: unit_id ? parseInt(unit_id, 10) : undefined,
        // --- แก้ไข: อัปเดตข้อมูล shelflife แบบใหม่ ---
        shelflife_value: shelflife_value !== undefined ? parseInt(shelflife_value, 10) : undefined,
        shelflife_unit_id: shelflife_unit_id ? parseInt(shelflife_unit_id, 10) : undefined,
      },
    });

    return NextResponse.json(updatedIngredient);
  } catch (error) {
    if (error.code === 'P2025') {
       return NextResponse.json({ error: 'ไม่พบวัตถุดิบที่ต้องการแก้ไข' }, { status: 404 });
    }
    console.error("INGREDIENTS_UPDATE_ERROR", error);
    return NextResponse.json(
      { error: 'ไม่สามารถอัปเดตวัตถุดิบได้' },
      { status: 500 }
    );
  }
}

// DELETE: ลบวัตถุดิบ (ไม่มีการเปลี่ยนแปลง)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'กรุณาระบุ id ของวัตถุดิบที่ต้องการลบ' },
        { status: 400 }
      );
    }

    await prisma.ingredients.delete({
      where: {
        ingredient_id: parseInt(id, 10),
      },
    });

    return NextResponse.json({ message: 'ลบวัตถุดิบสำเร็จ' });
  } catch (error) {
    if (error.code === 'P2025') {
       return NextResponse.json({ error: 'ไม่พบวัตถุดิบที่ต้องการลบ' }, { status: 404 });
    }
    if (error.code === 'P2003') {
        return NextResponse.json({ error: 'ไม่สามารถลบได้ เนื่องจากวัตถุดิบนี้ถูกใช้งานอยู่' }, { status: 409 });
    }
    console.error("INGREDIENTS_DELETE_ERROR", error);
    return NextResponse.json(
      { error: 'ไม่สามารถลบวัตถุดิบได้' },
      { status: 500 }
    );
  }
}
