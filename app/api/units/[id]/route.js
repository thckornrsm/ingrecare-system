// app/api/units/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req, { params }) {
  try {
    const id = parseInt(params.id, 10);
    const { name } = await req.json();
    if (Number.isNaN(id) || !name?.trim()) {
      return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
    }
    const updated = await prisma.units.update({
      where: { unit_id: id },
      data: { unit_name: name.trim() },
    });
    return NextResponse.json({ id: updated.unit_id, name: updated.unit_name });
  } catch (err) {
    console.error('UNITS_PUT_ERROR', err);
    return NextResponse.json({ error: 'แก้ไขหน่วยไม่สำเร็จ' }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const count = await prisma.ingredients.count({ where: { unit_id: id } });
    if (count > 0) {
      return NextResponse.json({ error: 'ไม่สามารถลบได้: มีวัตถุดิบใช้งานอยู่' }, { status: 400 });
    }

    await prisma.units.delete({ where: { unit_id: id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('UNITS_DELETE_ERROR', err);
    return NextResponse.json({ error: 'ลบหน่วยไม่สำเร็จ' }, { status: 500 });
  }
}
