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

    // ✅ validation ก่อนเข้า DB
    for (const item of items) {
      const isValidTimeUnit = TIME_UNITS.some(tu => tu.name === item.shelflife_unit_name);
      if (!isValidTimeUnit) {
        return NextResponse.json(
          { error: `ไม่พบหน่วยเวลา: ${item.shelflife_unit_name}` },
          { status: 400 }
        );
      }
      if (!item.received_date || isNaN(new Date(item.received_date).getTime())) {
        return NextResponse.json(
          { error: `วันที่รับเข้าไม่ถูกต้องของรายการ: ${item.name}` },
          { status: 400 }
        );
      }
      if (typeof item.shelflife_value !== 'number' || Number.isNaN(item.shelflife_value) || item.shelflife_value < 0) {
        return NextResponse.json(
          { error: `shelflife_value ไม่ถูกต้องของรายการ: ${item.name}` },
          { status: 400 }
        );
      }
      if (typeof item.quantity !== 'number' || Number.isNaN(item.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          { error: `จำนวน (quantity) ไม่ถูกต้องของรายการ: ${item.name}` },
          { status: 400 }
        );
      }
    }

    console.log('🚀 Starting batch creation for', items.length, 'items');

    // ✅ Step 1: สร้าง Batch (tx สั้น + เพิ่ม timeout)
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
    }, {
      maxWait: 10000,   // 10s
      timeout: 30000,   // 30s
      isolationLevel: 'ReadCommitted',
    });

    console.log('📦 Batch created:', batch.batch_id);

    // ✅ Step 2: ประมวลผลทีละ item (แยก tx + เพิ่ม timeout)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`🔄 [${i + 1}/${items.length}] Processing: ${item.name}`);

      try {
        const { receivedDate, expiryDate } = calcExpiryDate(
          item.received_date,
          item.shelflife_value,
          item.shelflife_unit_name
        );

        await prisma.$transaction(async (tx) => {
          // category
          const category = await tx.categories.findFirst({
            where: { category_name: item.category_name },
          });
          if (!category) throw new Error(`ไม่พบหมวดหมู่: ${item.category_name}`);

          // unit
          const unit = await tx.units.findFirst({
            where: { unit_name: item.unit_name },
          });
          if (!unit) throw new Error(`ไม่พบหน่วยนับ: ${item.unit_name}`);

          // ingredient (หา/สร้าง)
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
                shelflife_unit_name: item.shelflife_unit_name,
              },
            });
          }

          // ✅ stockin + history เป็น "คำสั่งเดียว" (nested write) เพื่อตัดปัญหา tx หลุดก่อน history.create
          const newStockin = await tx.stockin.create({
            data: {
              batch_id: batch.batch_id,
              ingredient_id: ingredient.ingredient_id,
              quantity: item.quantity,
              unit_id: unit.unit_id,
              received_date: receivedDate,
              expiry_date: expiryDate,
              user_id: userId,
              // สร้าง history ภายในคำสั่งเดียว
              histories: {
                create: [
                  {
                    action_type: 'stockin',
                    user_id: userId,
                  },
                ],
              },
            },
          });

          // ✅ inventory: ใช้ upsert ลดรอบ query
          await tx.ingredient_now.upsert({
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

          // expiry track
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

          // (ไม่ทำอะไรกับ newStockin ต่อ ลดโอกาสลากเวลาใน tx)
        }, {
          maxWait: 10000,  // 10s
          timeout: 30000,  // 30s
          isolationLevel: 'ReadCommitted',
        });

        console.log(`✅ [${i + 1}/${items.length}] Item processed: ${item.name}`);
      } catch (itemError) {
        console.error(`❌ Failed to process item ${item.name}:`, itemError);
        if (itemError && itemError.code === 'P2034') {
          throw new Error(`รายการ "${item.name}" ใช้เวลานานเกินกำหนด โปรดลองใหม่อีกครั้ง`);
        }
        throw new Error(`ล้มเหลวที่รายการ: ${item.name} - ${itemError.message || String(itemError)}`);
      }
    }

    console.log('✨ All items processed successfully');

    return NextResponse.json(
      {
        message: 'รับเข้าสต็อกสำเร็จ',
        batchId: batch.batch_id,
        lotNumber: batch.lot_number,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error('❌ STOCKIN ERROR:', e);
    const msg =
      e?.message ||
      (e?.code === 'P2034'
        ? 'คำสั่งใช้เวลานานเกินกำหนด โปรดลองใหม่'
        : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
