import { prisma } from '@/lib/prisma';
import { verifySession } from '@/utils/auth';
import { NextResponse } from 'next/server';
import { TIME_UNITS } from '@/app/constants/timeUnits';

/** ===== Utils ===== */
async function getSessionFromReq(req) {
  const token = req.cookies?.get?.('token') ?? null;
  if (!token || !token.value) {
    return { error: NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 }) };
  }
  const session = await verifySession(token.value);
  if (!session) {
    return { error: NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 }) };
  }
  return { session };
}

function calcExpiryDate(received, value, unitName) {
  const receivedDate = new Date(received);
  if (isNaN(receivedDate.getTime())) {
    throw new Error('วันที่รับเข้าไม่ถูกต้อง');
  }
  const expiryDate = new Date(receivedDate);
  const unitLower = (unitName || '').toLowerCase();

  switch (unitLower) {
    case 'วัน':
      expiryDate.setDate(expiryDate.getDate() + value);
      break;
    case 'สัปดาห์':
      expiryDate.setDate(expiryDate.getDate() + value * 7);
      break;
    case 'เดือน':
      expiryDate.setMonth(expiryDate.getMonth() + value);
      break;
    case 'ปี':
      expiryDate.setFullYear(expiryDate.getFullYear() + value);
      break;
    default:
      throw new Error(`Unsupported time unit: ${unitName}`);
  }
  return { receivedDate, expiryDate };
}

/** ================= GET ================= */
export async function GET(req) {
  try {
    const { session, error } = await getSessionFromReq(req);
    if (error) return error;
    const { sid: storeId } = session;

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    const filterConditions = [
      { user: { store_id: storeId } },
      { type: 'STOCK_IN' },
    ];

    if (categoryId) {
      filterConditions.push({
        stockins: {
          some: {
            ingredient: { category_id: parseInt(categoryId, 10) },
          },
        },
      });
    }

    const batches = await prisma.batch.findMany({
      where: { AND: filterConditions },
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
  } catch (err) {
    console.error('--- GET STOCKIN BATCHES ERROR ---', err);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลการรับเข้าได้' },
      { status: 500 }
    );
  }
}

/** ================= POST ================= */
export async function POST(req) {
  try {
    const { session, error } = await getSessionFromReq(req);
    if (error) return error;
    const { uid: userId, sid: storeId } = session;

    const body = await req.json();
    const { description, items } = body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'ไม่มีรายการนำเข้า' }, { status: 400 });
    }

    // ✅ ตรวจสอบข้อมูลก่อน
    for (const item of items) {
      const isValidTimeUnit = TIME_UNITS.some(tu => tu.name === item.shelflife_unit_name);
      if (!isValidTimeUnit) {
        return NextResponse.json(
          { error: `ไม่พบหน่วยเวลา: ${item.shelflife_unit_name}` },
          { status: 400 }
        );
      }
    }

    console.log('🚀 Starting batch creation for', items.length, 'items');

    // ✅ Step 1: สร้าง Batch
    const batch = await prisma.$transaction(async (tx) => {
      const lastStockinBatch = await tx.batch.findFirst({
        where: {
          type: 'STOCK_IN',
          user: { store_id: storeId },
          lot_number: { not: null },
        },
        orderBy: { lot_number: 'desc' },
        select: { lot_number: true },
      });

      const nextLotNumber = (lastStockinBatch?.lot_number || 0) + 1;

      return await tx.batch.create({
        data: {
          type: 'STOCK_IN',
          user_id: userId,
          lot_number: nextLotNumber,
          description: description || `Stock-in at ${new Date().toLocaleString('th-TH')}`,
        },
      });
    });

    console.log('📦 Batch created:', batch.batch_id);

    // ✅ Step 2: เตรียมข้อมูล (ดึงครั้งเดียว)
    const categoryNames = [...new Set(items.map(i => i.category_name))];
    const unitNames = [...new Set(items.map(i => i.unit_name))];

    const categories = await prisma.categories.findMany({
      where: { category_name: { in: categoryNames } },
    });

    const units = await prisma.units.findMany({
      where: { unit_name: { in: unitNames } },
    });

    const categoryMap = new Map(categories.map(c => [c.category_name, c]));
    const unitMap = new Map(units.map(u => [u.unit_name, u]));

    // ✅ Step 3: Process แต่ละ item (ไม่ใช้ Transaction เลย - แต่ทำเป็นลำดับ)
    const createdStockins = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`🔄 [${i + 1}/${items.length}] Processing: ${item.name}`);

      try {
        const category = categoryMap.get(item.category_name);
        if (!category) throw new Error(`ไม่พบหมวดหมู่: ${item.category_name}`);

        const unit = unitMap.get(item.unit_name);
        if (!unit) throw new Error(`ไม่พบหน่วยนับ: ${item.unit_name}`);

        const { receivedDate, expiryDate } = calcExpiryDate(
          item.received_date,
          item.shelflife_value,
          item.shelflife_unit_name
        );

        // ✅ หา/สร้าง Ingredient (ไม่ใช้ Transaction)
        let ingredient = await prisma.ingredients.findFirst({
          where: { name: item.name, category_id: category.category_id },
        });

        if (!ingredient) {
          ingredient = await prisma.ingredients.create({
            data: {
              name: item.name,
              shelflife_value: item.shelflife_value,
              category_id: category.category_id,
              unit_id: unit.unit_id,
              shelflife_unit_name: item.shelflife_unit_name,
            },
          });
        }

        // ✅ สร้าง Stockin (ไม่ใช้ Transaction)
        const stockin = await prisma.stockin.create({
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

        // ✅ สร้าง History (ไม่ใช้ Transaction)
        await prisma.history.create({
          data: {
            stockin_id: stockin.stockin_id,
            action_type: 'stockin',
            user_id: userId,
          },
        });

        // ✅ อัปเดต Inventory (ไม่ใช้ Transaction)
        await prisma.ingredient_now.upsert({
          where: { ingredient_id: ingredient.ingredient_id },
          update: {
            quantity: { increment: item.quantity },
            last_update: new Date(),
          },
          create: {
            batch_id: batch.batch_id,
            ingredient_id: ingredient.ingredient_id,
            quantity: item.quantity,
            unit_id: unit.unit_id,
            last_update: new Date(),
          },
        });

        // ✅ อัปเดต Expiry Track (ไม่ใช้ Transaction)
        await prisma.expiry_tack.upsert({
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

        createdStockins.push({ stockin, ingredient });
        console.log(`✅ [${i + 1}/${items.length}] Item processed: ${item.name}`);

      } catch (itemError) {
        console.error(`❌ Failed to process item ${item.name}:`, itemError);
        
        // Rollback: ลบ Batch (cascade delete stockins)
        try {
          await prisma.batch.delete({ 
            where: { batch_id: batch.batch_id }
          });
          console.log('🔄 Rollback completed');
        } catch (deleteError) {
          console.error('❌ Failed to rollback:', deleteError);
        }
        
        throw new Error(`ล้มเหลวที่รายการ: ${item.name} - ${itemError.message}`);
      }
    }

    console.log('✨ All items processed successfully');

    return NextResponse.json(
      {
        message: 'รับเข้าสต็อกสำเร็จ',
        batchId: batch.batch_id,
        lotNumber: batch.lot_number,
        itemsProcessed: createdStockins.length,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error('❌ STOCKIN ERROR:', e);
    const msg = e?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}