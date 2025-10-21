// app/api/categories/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req, { params }) {
  try {
    const id = parseInt(params.id, 10);
    const { name } = await req.json();
    if (Number.isNaN(id) || !name?.trim()) {
      return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }
    const updated = await prisma.categories.update({
      where: { category_id: id },
      data: { category_name: name.trim() },
    });
    return NextResponse.json({ id: updated.category_id, name: updated.category_name });
  } catch (err) {
    console.error('CATEGORIES_PUT_ERROR', err);
    return NextResponse.json({ error: 'แก้ไขหมวดหมู่ไม่สำเร็จ' }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const count = await prisma.ingredients.count({ where: { category_id: id } });
    if (count > 0) {
      return NextResponse.json({ error: 'ไม่สามารถลบได้: มีวัตถุดิบใช้งานอยู่' }, { status: 400 });
    }

    await prisma.categories.delete({ where: { category_id: id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('CATEGORIES_DELETE_ERROR', err);
    return NextResponse.json({ error: 'ลบหมวดหมู่ไม่สำเร็จ' }, { status: 500 });
  }
}
