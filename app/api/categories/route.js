import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET: ดึงข้อมูลหมวดหมู่ทั้งหมด
export async function GET(req) {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: {
        category_id: 'asc',
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("CATEGORIES_FETCH_ERROR", error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลหมวดหมู่ได้' },
      { status: 500 }
    );
  }
}

// POST: สร้างหมวดหมู่ใหม่
export async function POST(req) {
  try {
    const { category_name, description } = await req.json();

    if (!category_name) {
      return NextResponse.json(
        { error: 'กรุณาระบุ category_name' },
        { status: 400 }
      );
    }

    const newCategory = await prisma.categories.create({
      data: {
        category_name,
        description,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("CATEGORIES_CREATE_ERROR", error);
    return NextResponse.json(
      { error: 'ไม่สามารถสร้างหมวดหมู่ได้' },
      { status: 500 }
    );
  }
}

// PUT: อัปเดตข้อมูลหมวดหมู่
export async function PUT(req) {
  try {
    const { category_id, category_name, description } = await req.json();

    if (!category_id) {
      return NextResponse.json(
        { error: 'กรุณาระบุ category_id' },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.categories.update({
      where: {
        category_id: parseInt(category_id, 10),
      },
      data: {
        category_name,
        description, // สามารถส่งเป็น null หรือ undefined เพื่อล้างค่าได้
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error.code === 'P2025') {
       return NextResponse.json({ error: 'ไม่พบหมวดหมู่ที่ต้องการแก้ไข' }, { status: 404 });
    }
    console.error("CATEGORIES_UPDATE_ERROR", error);
    return NextResponse.json(
      { error: 'ไม่สามารถอัปเดตหมวดหมู่ได้' },
      { status: 500 }
    );
  }
}

// DELETE: ลบหมวดหมู่
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'กรุณาระบุ id ของหมวดหมู่ที่ต้องการลบ' },
        { status: 400 }
      );
    }

    await prisma.categories.delete({
      where: {
        category_id: parseInt(id, 10),
      },
    });

    return NextResponse.json({ message: 'ลบหมวดหมู่สำเร็จ' });
  } catch (error) {
    if (error.code === 'P2025') {
       return NextResponse.json({ error: 'ไม่พบหมวดหมู่ที่ต้องการลบ' }, { status: 404 });
    }
    // Error code for foreign key constraint violation
    if (error.code === 'P2003') {
        return NextResponse.json({ error: 'ไม่สามารถลบได้ เนื่องจากหมวดหมู่นี้ถูกใช้งานอยู่' }, { status: 409 });
    }
    console.error("CATEGORIES_DELETE_ERROR", error);
    return NextResponse.json(
      { error: 'ไม่สามารถลบหมวดหมู่ได้' },
      { status: 500 }
    );
  }
}