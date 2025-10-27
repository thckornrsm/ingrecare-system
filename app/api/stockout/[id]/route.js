import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/utils/auth';

/** DELETE: ยกเลิกรายการ → คืนสต็อกแล้วลบ */
export async function DELETE(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });

    const stockoutId = Number(params?.id);
    if (!Number.isFinite(stockoutId)) {
      return NextResponse.json({ error: 'ID ไม่ถูกต้อง' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const row = await tx.stockout.findUnique({ where: { stockout_id: stockoutId } });
      if (!row) throw new Error('NOT_FOUND');

      // คืนสต็อก
      await tx.ingredient_now.updateMany({
        where: { ingredient_id: row.ingredient_id },
        data: { quantity: { increment: row.quantity } },
      });

      await tx.history.deleteMany({ where: { stockout_id: stockoutId } }).catch(() => {});
      await tx.stockout.delete({ where: { stockout_id: stockoutId } });

      const agg = await tx.ingredient_now.aggregate({
        where: { ingredient_id: row.ingredient_id },
        _sum: { quantity: true },
      });

      return {
        deletedId: row.stockout_id,
        ingredient_id: row.ingredient_id,
        inventory_total: Number(agg?._sum?.quantity ?? 0),
      };
    });

    return NextResponse.json({
      message: `ยกเลิกรายการเบิกจ่าย #${result.deletedId} และคืนสต็อกเรียบร้อย`,
      ingredient_id: result.ingredient_id,
      inventory_total: result.inventory_total,
    });
  } catch (e) {
    if (e?.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'ไม่พบรายการเบิกจ่ายที่ต้องการลบ' }, { status: 404 });
    }
    console.error('--- DELETE STOCKOUT ERROR ---', e);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' }, { status: 500 });
  }
}

/** PUT: แก้ไขรายการ → ปรับส่วนต่างสต็อก + อัปเดตเวลา (field ใน schema คือ out_date) */
export async function PUT(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const session = await verifySession(token);
    if (!session) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });

    const stockoutId = Number(params?.id);
    if (!Number.isFinite(stockoutId)) {
      return NextResponse.json({ error: 'ID ไม่ถูกต้อง' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { quantity, out_datetime, out_date } = body || {};

    const newQty = Number(quantity);
    if (!Number.isFinite(newQty) || newQty < 0) {
      return NextResponse.json({ error: 'จำนวนไม่ถูกต้อง' }, { status: 400 });
    }

    let parsedNewDate = null;
    const candidate = typeof out_date !== 'undefined' ? out_date : out_datetime;
    if (typeof candidate === 'string' && candidate.trim()) {
      const d = new Date(candidate);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: 'รูปแบบวันที่/เวลาไม่ถูกต้อง' }, { status: 400 });
      }
      parsedNewDate = d;
    }

    const result = await prisma.$transaction(async (tx) => {
      const old = await tx.stockout.findUnique({ where: { stockout_id: stockoutId } });
      if (!old) throw new Error('NOT_FOUND');

      const diff = Number(old.quantity) - newQty; // + = คืนของ, - = เบิกเพิ่ม
      if (diff !== 0) {
        const inv = await tx.ingredient_now.findFirst({
          where: { ingredient_id: old.ingredient_id },
        });
        if (!inv) throw new Error('INVENTORY_NOT_FOUND');

        if (diff < 0 && Number(inv.quantity ?? 0) < Math.abs(diff)) {
          throw new Error('INSUFFICIENT_STOCK');
        }

        await tx.ingredient_now.updateMany({
          where: { ingredient_id: old.ingredient_id },
          data: { quantity: { increment: diff } },
        });
      }

      const updated = await tx.stockout.update({
        where: { stockout_id: stockoutId },
        data: {
          quantity: newQty,
          out_date: parsedNewDate ?? old.out_date,
        },
        include: { ingredient: { include: { category: true } }, unit: true },
      });

      const agg = await tx.ingredient_now.aggregate({
        where: { ingredient_id: old.ingredient_id },
        _sum: { quantity: true },
      });

      return {
        updated,
        ingredient_id: old.ingredient_id,
        inventory_total: Number(agg?._sum?.quantity ?? 0),
      };
    });

    return NextResponse.json({
      message: `อัปเดตรายการ #${result.updated.stockout_id} สำเร็จ`,
      updatedItem: result.updated,
      ingredient_id: result.ingredient_id,
      inventory_total: result.inventory_total,
    });
  } catch (e) {
    if (e?.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'ไม่พบรายการที่ต้องการแก้ไข' }, { status: 404 });
    }
    if (e?.message === 'INVENTORY_NOT_FOUND') {
      return NextResponse.json({ error: 'ไม่พบข้อมูลสต็อกของวัตถุดิบนี้' }, { status: 404 });
    }
    if (e?.message === 'INSUFFICIENT_STOCK') {
      return NextResponse.json({ error: 'ไม่สามารถเบิกเพิ่มได้เนื่องจากสต็อกไม่เพียงพอ' }, { status: 409 });
    }
    console.error('--- PUT STOCKOUT ERROR ---', e);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล' }, { status: 500 });
  }
}
