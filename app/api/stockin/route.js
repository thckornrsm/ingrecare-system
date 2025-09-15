import { prisma } from '@/lib/prisma';
import { verifySession } from '@/utils/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    const whereClause = {};

    // ถ้ามีการระบุ categoryId, ให้สร้างเงื่อนไขการค้นหาที่ซับซ้อนขึ้น
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
          select: {
            name: true,
            email: true,
          }
        },
        stockins: {
          include: {
            ingredient: {
              select: {
                name: true,
                category: {
                  select: {
                    category_name: true,
                  }
                }
              }
            },
            unit: {
              select: {
                unit_name: true,
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'asc',
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

export async function POST(req) {
  try {
    // ดึง token จากคุกกี้
    const token = req.cookies.get('token');

    if (!token || !token.value) {
      console.error("No token provided or token value is empty");
      return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 });
    }

    console.log('✅ RAW TOKEN COOKIE VALUE:', token.value);

    // ตรวจสอบว่า token เป็น JWT ที่มี 3 ส่วนหรือไม่
    if (token.value.split('.').length !== 3) {
      console.error("Invalid JWT format");
      return NextResponse.json({ error: 'token ไม่ถูกต้อง' }, { status: 401 });
    }

    // ตรวจสอบ session โดยใช้ token ที่รับมา
    let session;
    try {
      session = await verifySession(token.value);
      console.log('✅ SESSION DATA:', session);
    } catch (error) {
      console.error("JWT verification failed:", error);
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }

    if (!session) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
    }

    const { uid: userId } = session;
    console.log('✅ USER ID:', userId);

    const body = await req.json();
    console.log('✅ RECEIVED BODY:', JSON.stringify(body, null, 2));
    const { description, items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง, กรุณาระบุรายการสินค้า (items)' },
        { status: 400 }
      );
    }

    const receivedTime = new Date();

    const newBatch = await prisma.$transaction(async (tx) => {
      console.log('--- Starting Transaction ---');
      const batch = await tx.batch.create({
        data: {
          user_id: userId,
          description: description || `Stock-in at ${receivedTime.toLocaleString()}`,
        },
      });
      console.log('✅ Batch Created, ID:', batch.batch_id);

      for (const item of items) {
        const expiryDateObject = new Date(item.expiry_date);
        if (isNaN(expiryDateObject.getTime())) {
          throw new Error(`Invalid expiry_date format for ingredient ${item.ingredient_id}: ${item.expiry_date}`);
        }

        const newStockin = await tx.stockin.create({
          data: {
            batch_id: batch.batch_id,
            ingredient_id: item.ingredient_id,
            quantity: item.quantity,
            unit_id: item.unit_id,
            received_date: receivedTime,
            expiry_date: expiryDateObject,
            user_id: userId,
          },
        });
        console.log(`  ✅ Stockin record created for item ${item.ingredient_id}`);

        await tx.history.create({
          data: { action_type: 'stockin', stockin_id: newStockin.stockin_id, user_id: userId },
        });
        console.log(`  ✅ History record created for item ${item.ingredient_id}`);

        const existingInventory = await tx.ingredient_now.findFirst({
          where: { ingredient_id: item.ingredient_id },
        });

        if (existingInventory) {
          await tx.ingredient_now.update({
            where: { inventory_id: existingInventory.inventory_id },
            data: { quantity: { increment: item.quantity }, last_update: receivedTime },
          });
          console.log(`  ✅ Inventory UPDATED for item ${item.ingredient_id}`);
        } else {
          await tx.ingredient_now.create({
            data: {
              batch_id: batch.batch_id,
              ingredient_id: item.ingredient_id,
              quantity: item.quantity,
              unit_id: item.unit_id,
              last_update: receivedTime,
            },
          });
          console.log(`  ✅ Inventory CREATED for item ${item.ingredient_id}`);
        }

        await tx.expiry_tack.create({
          data: {
            batch_id: batch.batch_id,
            ingredient_id: item.ingredient_id,
            expiry_date: expiryDateObject
          }
        });
        console.log(`  ✅ Expiry Tack record created for item ${item.ingredient_id}`);
      }

      return batch;
    });

    return NextResponse.json(
      { message: 'รับเข้าสต็อกสำเร็จ', batchId: newBatch.batch_id },
      { status: 201 }
    );
  } catch (e) {
    console.error('--- FULL STOCKIN ERROR OBJECT ---');
    console.error(e);
    console.error('--- END OF ERROR OBJECT ---');
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }, { status: 500 });
  }
}
