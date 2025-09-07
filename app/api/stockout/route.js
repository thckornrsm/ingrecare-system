import { prisma } from '@/lib/prisma';
import { verifySession } from '@/utils/auth';
import { NextResponse } from 'next/server';

/**
 * @description สร้างรายการเบิกของออกจากสต็อก (Stock-out)
 * @param {Request} req
 * @returns {NextResponse}
 */
export async function POST(req) {
  try {
    // 1. ตรวจสอบสิทธิ์ผู้ใช้
    const token = req.cookies.get('token');
    if (!token || !token.value) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 });
    }

    // ทำความสะอาด token (จากโค้ด stockin)
    let cleanToken = token.value;
    if (cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
      cleanToken = cleanToken.slice(1, -1);
    }
    if (cleanToken.startsWith('auth=')) {
      cleanToken = cleanToken.substring(5);
    }

    const session = await verifySession(cleanToken);
    if (!session) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }
    const { uid: userId } = session;

    // 2. แยกข้อมูลจาก body
    const body = await req.json();
    const { description, items } = body;

    // 3. ตรวจสอบข้อมูลเบื้องต้น
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง, กรุณาระบุรายการสินค้า (items)' },
        { status: 400 }
      );
    }
    
    const outTime = new Date();

    // 4. ทำงานกับฐานข้อมูลใน Transaction เดียว
    const newBatch = await prisma.$transaction(async (tx) => {
      // ขั้นตอนสำคัญ: ตรวจสอบสต็อกของทุกรายการ "ก่อน" เริ่มทำธุรกรรม
      for (const item of items) {
        const currentInventory = await tx.ingredient_now.findFirst({
          where: { ingredient_id: item.ingredient_id },
        });

        // ถ้าไม่มีของในสต็อก หรือมีไม่พอ ให้โยน Error ทันที
        if (!currentInventory || currentInventory.quantity < item.quantity) {
          const ingredient = await tx.ingredients.findUnique({
            where: { ingredient_id: item.ingredient_id },
            select: { name: true }
          });
          const ingredientName = ingredient?.name || `ID ${item.ingredient_id}`;
          throw new Error(`สินค้าไม่พอ: '${ingredientName}' มีในสต็อก ${currentInventory?.quantity || 0} แต่ต้องการเบิก ${item.quantity}`);
        }
      }

      // ถ้าของมีพอสำหรับทุกรายการ ให้เริ่มทำธุรกรรม
      const batch = await tx.batch.create({
        data: {
          user_id: userId,
          description: description || `Stock-out at ${outTime.toLocaleString()}`,
        },
      });

      for (const item of items) {
        // สร้าง record การเบิกของ
        const newStockout = await tx.stockout.create({
          data: {
            batch_id: batch.batch_id,
            ingredient_id: item.ingredient_id,
            quantity: item.quantity,
            unit_id: item.unit_id,
            out_date: outTime,
            user_id: userId,
          },
        });

        // สร้าง record ประวัติ
        await tx.history.create({
          data: {
            action_type: 'stockout',
            stockout_id: newStockout.stockout_id,
            user_id: userId,
          },
        });

        // อัปเดต (หักลบ) ยอดสต็อกคงเหลือ
        const inventoryItem = await tx.ingredient_now.findFirst({
          where: { ingredient_id: item.ingredient_id }
        });

        await tx.ingredient_now.update({
          where: {
            inventory_id: inventoryItem.inventory_id
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
            last_update: outTime,
          },
        });
      }

      return batch;
    });

    return NextResponse.json(
      { message: 'เบิกของสำเร็จ', batchId: newBatch.batch_id },
      { status: 201 }
    );

  } catch (e) {
    console.error('--- STOCKOUT ERROR ---', e);
    // ดักจับ Error ที่เราสร้างขึ้นเองเพื่อส่งข้อความที่เข้าใจง่ายให้ผู้ใช้
    if (e.message.startsWith('สินค้าไม่พอ:')) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเบิกของ' }, { status: 500 });
  }
}
