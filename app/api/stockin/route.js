import { prisma } from '@/lib/prisma';
import { verifySession } from '@/utils/auth';
import { NextResponse } from 'next/server';

/**
 * @description ดึงข้อมูล Batch ของ Stock In เท่านั้น (สำหรับหน้า Dashboard)
 */
export async function GET(req) {
  try {
    const token = req.cookies.get('token');
    if (!token || !token.value) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 });
    }
    const session = await verifySession(token.value);
    if (!session) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }
    const { sid: storeId } = session;

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    const filterConditions = [
        { user: { store_id: storeId } },
        { type: 'STOCK_IN' } // ✨ กรองเอาเฉพาะ batch ของ Stock In เสมอ
    ];

    if (categoryId) {
      filterConditions.push({
        stockins: {
          some: {
            ingredient: {
              category_id: parseInt(categoryId),
            },
          },
        },
      });
    }

    const batches = await prisma.batch.findMany({
      where: { 
        AND: filterConditions 
      },
      include: {
        user: { select: { name: true, email: true } },
        stockins: {
          include: {
            ingredient: {
              select: {
                ingredient_id: true,
                name: true,
                category: { select: { category_name: true } },
              },
            },
            unit: { select: { unit_name: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(batches);

  } catch (error) {
    console.error('--- GET STOCKIN BATCHES ERROR ---', error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลการรับเข้าได้' },
      { status: 500 }
    );
  }
}


/**
 * @description สร้างรายการนำเข้าสินค้า (Stock In)
 */
export async function POST(req) {
  try {
    const token = req.cookies?.get?.('token') ?? null;
    if (!token || !token.value) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 });
    }

    const session = await verifySession(token.value);
    if (!session) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const { uid: userId, sid: storeId } = session;
    const body = await req.json();
    const { description, items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'ไม่มีรายการนำเข้า' }, { status: 400 });
    }

    const newBatch = await prisma.$transaction(async (tx) => {
      
      const lastStockinBatch = await tx.batch.findFirst({
        where: {
          type: 'STOCK_IN',
          user: { store_id: storeId },
          lot_number: { not: null } // ✨ แก้ไขจุดนี้: กรองเอา Lot เก่าที่เป็น NULL ออก
        },
        orderBy: { lot_number: 'desc' },
        select: { lot_number: true }
      });

      const nextLotNumber = (lastStockinBatch?.lot_number || 0) + 1;

      const batch = await tx.batch.create({
        data: {
          type: 'STOCK_IN', // ✨ แก้ไขจุดนี้: ระบุ type ตอนสร้าง
          user_id: userId,
          lot_number: nextLotNumber, // ✨ แก้ไขจุดนี้: ใส่เลข Lot ที่คำนวณได้
          description: description || `Stock-in at ${new Date().toLocaleString('th-TH')}`,
        },
      });

      for (const item of items) {
        const category = await tx.categories.findFirst({
          where: { category_name: item.category_name },
        });
        if (!category) throw new Error(`ไม่พบหมวดหมู่: ${item.category_name}`);

        const unit = await tx.units.findFirst({
          where: { unit_name: item.unit_name },
        });
        if (!unit) throw new Error(`ไม่พบหน่วยนับ: ${item.unit_name}`);

        const shelflifeUnit = await tx.time_units.findFirst({
          where: { unit_name: item.shelflife_unit_name },
        });
        if (!shelflifeUnit) throw new Error(`ไม่พบหน่วยเวลา: ${item.shelflife_unit_name}`);

        let ingredient = await tx.ingredients.findFirst({
          where: { name: item.name, category_id: category.category_id },
        });

        if (!ingredient) {
          ingredient = await tx.ingredients.create({
            data: {
              name: item.name,
              shelflife_value: item.shelflife_value,
              category: { connect: { category_id: category.category_id } },
              unit: { connect: { unit_id: unit.unit_id } },
              shelflife_unit: { connect: { unit_id: shelflifeUnit.unit_id } },
            },
          });
        }

        const receivedDate = new Date(item.received_date);
        const expiryDate = new Date(receivedDate);

        switch (shelflifeUnit.unit_name.toLowerCase()) {
          case 'วัน': 
            expiryDate.setDate(expiryDate.getDate() + item.shelflife_value); 
            break;
          case 'สัปดาห์': 
            expiryDate.setDate(expiryDate.getDate() + item.shelflife_value * 7); 
            break;
          case 'เดือน': 
            expiryDate.setMonth(expiryDate.getMonth() + item.shelflife_value); 
            break;
          case 'ปี': 
            expiryDate.setFullYear(expiryDate.getFullYear() + item.shelflife_value); 
            break;
          default: 
            throw new Error(`Unsupported time unit: ${shelflifeUnit.unit_name}`);
        }

        const newStockin = await tx.stockin.create({
          data: {
            batch_id: batch.batch_id,
            ingredient_id: ingredient.ingredient_id,
            quantity: item.quantity,
            unit_id: unit.unit_id,
            received_date: receivedDate,
            expiry_date: expiryDate,
            user_id: userId,
          },
        });

        await tx.history.create({
          data: {
            action_type: 'stockin',
            stockin_id: newStockin.stockin_id,
            user_id: userId,
          },
        });

        const existingInventory = await tx.ingredient_now.findFirst({
          where: { ingredient_id: ingredient.ingredient_id },
        });

        if (existingInventory) {
          await tx.ingredient_now.update({
            where: { inventory_id: existingInventory.inventory_id },
            data: {
              quantity: { increment: item.quantity },
              last_update: new Date(),
            },
          });
        } else {
          await tx.ingredient_now.create({
            data: {
              batch_id: batch.batch_id,
              ingredient_id: ingredient.ingredient_id,
              quantity: item.quantity,
              unit_id: unit.unit_id,
              last_update: new Date(),
            },
          });
        }

        await tx.expiry_tack.upsert({
          where: {
            batch_id_ingredient_id: {
              batch_id: batch.batch_id,
              ingredient_id: ingredient.ingredient_id,
            },
          },
          update: { expiry_date: expiryDate },
          create: {
            batch_id: batch.batch_id,
            ingredient_id: ingredient.ingredient_id,
            expiry_date: expiryDate,
          },
        });
      }

      return batch;
    }, {
      isolationLevel: 'Serializable'
    });

    return NextResponse.json(
      { 
        message: 'รับเข้าสต็อกสำเร็จ', 
        batchId: newBatch.batch_id,
        lotNumber: newBatch.lot_number 
      },
      { status: 201 }
    );

  } catch (e) {
    console.error('--- FULL STOCKIN ERROR OBJECT ---', e);
    return NextResponse.json(
      { error: e.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
      { status: 500 }
    );
  }
}