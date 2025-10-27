import { prisma } from '@/lib/prisma';
import { verifySession } from '@/utils/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * @description ดึงข้อมูลประวัติการเบิกของทั้งหมด (สำหรับร้านค้าที่ล็อกอินอยู่)
 * @param {Request} req
 * @returns {NextResponse}
 */
export async function GET(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token || !token.value) {
            return NextResponse.json({ error: 'ไม่พบ token' }, { status: 401 });
        }
        const session = await verifySession(token.value);
        if (!session) {
            return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
        }
        const { sid: storeId } = session;

        const stockouts = await prisma.stockout.findMany({
            where: {
                user: {
                    store_id: storeId,
                }
            },
            orderBy: {
                out_date: 'desc',
            },
            include: {
                ingredient: {
                    include: {
                        category: true,
                    },
                },
                unit: true,
                user: {
                    select: {
                        name: true
                    }
                }
            },
        });
        return NextResponse.json(stockouts, { status: 200 });
    } catch (e) {
        console.error('--- GET ALL STOCKOUTS ERROR ---', e);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 });
    }
}

/**
 * @description สร้างรายการเบิกของออกจากสต็อก (Stock-out)
 * @param {Request} req
 * @returns {NextResponse}
 */
export async function POST(req) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
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
        
        const outTime = new Date();

        const newBatch = await prisma.$transaction(async (tx) => {
            // 1. ตรวจสอบสต็อกทั้งหมดก่อนเริ่มทำรายการ
            for (const item of items) {
                const currentInventory = await tx.ingredient_now.findFirst({
                    where: { ingredient_id: item.ingredient_id },
                });

                if (!currentInventory || currentInventory.quantity < item.quantity) {
                    const ingredient = await tx.ingredients.findUnique({
                        where: { ingredient_id: item.ingredient_id },
                        select: { name: true }
                    });
                    const ingredientName = ingredient?.name || `ID ${item.ingredient_id}`;
                    throw new Error(`สินค้าไม่พอ: '${ingredientName}' มีในสต็อก ${currentInventory?.quantity || 0} แต่ต้องการเบิก ${item.quantity}`);
                }
            }

            // 2. สร้าง Batch
            const batch = await tx.batch.create({
                data: {
                    type: 'STOCK_OUT',
                    user_id: userId,
                    description: description || `Stock-out at ${outTime.toLocaleString('th-TH')}`,
                },
            });

            // 3. วนลูปเพื่อสร้าง stockout และอัปเดตสต็อก
            for (const item of items) {
                // สร้างรายการเบิกจ่าย
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

                // **แก้ไข:** อัปเดตสต็อกด้วย updateMany เพื่อความเสถียร
                await tx.ingredient_now.updateMany({
                    where: { ingredient_id: item.ingredient_id },
                    data: { 
                        quantity: { decrement: item.quantity },
                        last_update: outTime 
                    },
                });

                // บันทึก history
                await tx.history.create({
                    data: {
                        action_type: 'stockout',
                        stockout_id: newStockout.stockout_id,
                        user_id: userId,
                    },
                });
            }
            return batch;
        });

        return NextResponse.json({ message: 'เบิกของสำเร็จ', batchId: newBatch.batch_id }, { status: 201 });

    } catch (e) {
        console.error('--- STOCKOUT ERROR ---', e);
        if (e.message.startsWith('สินค้าไม่พอ:')) {
            return NextResponse.json({ error: e.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเบิกของ' }, { status: 500 });
    }
}

