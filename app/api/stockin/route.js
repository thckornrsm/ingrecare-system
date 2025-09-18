import { prisma } from '@/lib/prisma';
import { verifySession } from '@/utils/auth';
import { NextResponse } from 'next/server';

// GET function ไม่มีการเปลี่ยนแปลง
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

    const whereClause = {
        user: {
            store_id: storeId,
        }
    };

    if (categoryId) {
      whereClause.stockins = {
        some: {
          ingredient: {
            category_id: parseInt(categoryId),
          },
        },
      };
    }

    const batches = await prisma.batch.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, email: true }
        },
        stockins: {
          include: {
            ingredient: {
              select: {
                name: true,
                category: {
                  select: { category_name: true }
                }
              }
            },
            unit: {
              select: { unit_name: true }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc',
      },
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


// --- POST function แก้ไขใหม่ทั้งหมด ---
export async function POST(req) {
  try {
    const token = req.cookies.get('token');
    if (!token || !token.value) {
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 });
    }

    const session = await verifySession(token.value);
    if (!session) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const { uid: userId } = session;
    const body = await req.json();
    const { description, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง, กรุณาระบุรายการสินค้า (items)' },
        { status: 400 }
      );
    }

    const newBatch = await prisma.$transaction(async (tx) => {
      console.log('--- Starting Stock-in Transaction ---');
      const batch = await tx.batch.create({
        data: {
          user_id: userId,
          description: description || `Stock-in at ${new Date().toLocaleString()}`,
        },
      });
      console.log('✅ Batch Created, ID:', batch.batch_id);

      for (const item of items) {
        // --- ส่วนที่แก้ไข ---
        // 1. ค้นหา ID จากชื่อที่ส่งมาจาก Frontend
        const category = await tx.categories.findFirst({ where: { category_name: item.category_name } });
        if (!category) throw new Error(`ไม่พบหมวดหมู่: ${item.category_name}`);
        
        const unit = await tx.units.findFirst({ where: { unit_name: item.unit_name } });
        if (!unit) throw new Error(`ไม่พบหน่วยนับ: ${item.unit_name}`);

        const shelflifeUnit = await tx.time_units.findFirst({ where: { unit_name: item.shelflife_unit_name } });
        if (!shelflifeUnit) throw new Error(`ไม่พบหน่วยเวลา: ${item.shelflife_unit_name}`);

        const categoryId = category.category_id;
        const unitId = unit.unit_id;
        const shelflifeUnitId = shelflifeUnit.unit_id;

        // 2. ค้นหา หรือ สร้าง วัตถุดิบใหม่ โดยใช้ ID ที่ได้มา
        let ingredient = await tx.ingredients.findFirst({
            where: {
                name: item.name,
                category_id: categoryId,
            }
        });

        if (!ingredient) {
            ingredient = await tx.ingredients.create({
                data: {
                    name: item.name,
                    shelflife_value: item.shelflife_value,
                    category: { connect: { category_id: categoryId } },
                    unit: { connect: { unit_id: unitId } },
                    shelflife_unit: { connect: { unit_id: shelflifeUnitId } }
                }
            });
            console.log(`  ✅ Ingredient CREATED: ${ingredient.name} (ID: ${ingredient.ingredient_id})`);
        } else {
            console.log(`  ✅ Ingredient FOUND: ${ingredient.name} (ID: ${ingredient.ingredient_id})`);
        }
        
        const ingredientId = ingredient.ingredient_id;
        const receivedDate = new Date(item.received_date);
        
        const expiryDateObject = new Date(receivedDate);
        switch (shelflifeUnit.unit_name.toLowerCase()) {
          case 'วัน': expiryDateObject.setDate(expiryDateObject.getDate() + item.shelflife_value); break;
          case 'สัปดาห์': expiryDateObject.setDate(expiryDateObject.getDate() + item.shelflife_value * 7); break;
          case 'เดือน': expiryDateObject.setMonth(expiryDateObject.getMonth() + item.shelflife_value); break;
          case 'ปี': expiryDateObject.setFullYear(expiryDateObject.getFullYear() + item.shelflife_value); break;
          default: throw new Error(`Unsupported time unit: ${shelflifeUnit.unit_name}`);
        }

        const newStockin = await tx.stockin.create({
          data: {
            batch_id: batch.batch_id,
            ingredient_id: ingredientId,
            quantity: item.quantity,
            unit_id: unitId, // <-- ใช้ ID ที่ได้มา
            received_date: receivedDate,
            expiry_date: expiryDateObject,
            user_id: userId,
          },
        });
        console.log(`  ✅ Stockin record created for item ${ingredient.name}`);

        await tx.history.create({
          data: { action_type: 'stockin', stockin_id: newStockin.stockin_id, user_id: userId },
        });
        console.log(`  ✅ History record created for item ${ingredient.name}`);

        const existingInventory = await tx.ingredient_now.findFirst({
          where: { ingredient_id: ingredientId },
        });

        if (existingInventory) {
          await tx.ingredient_now.update({
            where: { inventory_id: existingInventory.inventory_id },
            data: { quantity: { increment: item.quantity }, last_update: new Date() },
          });
          console.log(`  ✅ Inventory UPDATED for item ${ingredient.name}`);
        } else {
          await tx.ingredient_now.create({
            data: {
              batch_id: batch.batch_id,
              ingredient_id: ingredientId,
              quantity: item.quantity,
              unit_id: unitId,
              last_update: new Date(),
            },
          });
          console.log(`  ✅ Inventory CREATED for item ${ingredient.name}`);
        }

        await tx.expiry_tack.upsert({
          where: { batch_id_ingredient_id: { batch_id: batch.batch_id, ingredient_id: ingredientId } },
          update: { expiry_date: expiryDateObject },
          create: {
            batch_id: batch.batch_id,
            ingredient_id: ingredientId,
            expiry_date: expiryDateObject
          }
        });
        console.log(`  ✅ Expiry Tack record created/updated for item ${ingredient.name}`);
      }

      return batch;
    });

    return NextResponse.json(
      { message: 'รับเข้าสต็อกสำเร็จ', batchId: newBatch.batch_id },
      { status: 201 }
    );
  } catch (e) {
    console.error('--- FULL STOCKIN ERROR OBJECT ---', e);
    return NextResponse.json({ error: e.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }, { status: 500 });
  }
}

