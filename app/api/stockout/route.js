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

        // ⚠️ แก้ไข: เพิ่ม timeout เป็น 30 วินาที (แก้ P2028)
        const newBatch = await prisma.$transaction(async (tx) => {
            
            // ⚠️ แก้ไข: ลบ Loop ตรวจสอบสต็อก (สเต็ป 1) ทิ้งไปเลย (แก้ Race Condition)
            
            // 1. สร้าง Batch
            const batch = await tx.batch.create({
                data: {
                    type: 'STOCK_OUT',
                    user_id: userId,
                    description: description || `Stock-out at ${outTime.toLocaleString('th-TH')}`,
                },
            });

            // 2. วนลูปเพื่อสร้าง stockout และ "พยายาม" อัปเดตสต็อก
            for (const item of items) {
                
                // ⚠️ แก้ไข: รวม "เช็ก" และ "ตัด" สต็อกไว้ในคำสั่งเดียว
                const updateResult = await tx.ingredient_now.updateMany({
                    where: { 
                        ingredient_id: item.ingredient_id,
                        quantity: { gte: item.quantity } // <--- เพิ่มเงื่อนไข "ของต้องพอ"
                    },
                    data: { 
                        quantity: { decrement: item.quantity },
                        last_update: outTime 
                    },
                });

                // ⚠️ แก้ไข: ตรวจสอบว่าตัดสำเร็จหรือไม่
                if (updateResult.count === 0) {
                    const ingredient = await tx.ingredients.findUnique({
                        where: { ingredient_id: item.ingredient_id },
                        select: { name: true }
                    });
                    const ingredientName = ingredient?.name || `ID ${item.ingredient_id}`;
                    
                    // ถ้าไม่สำเร็จ (ของไม่พอ) ให้ยกเลิกทั้งหมด
                    throw new Error(`สินค้าไม่พอ: '${ingredientName}' (ต้องการ ${item.quantity} แต่ของอาจไม่พอ)`);
                }

                // สร้างรายการเบิกจ่าย (ถ้าตัดสต็อกสำเร็จ)
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
        }, {
            timeout: 30000  // <-- เพิ่ม timeout 30 วินาที ตรงนี้
        }); // <-- ปิด $transaction

        return NextResponse.json({ message: 'เบิกของสำเร็จ', batchId: newBatch.batch_id }, { status: 201 });

    } catch (e) {
        console.error('--- STOCKOUT ERROR ---', e);
        if (e.message.startsWith('สินค้าไม่พอ:')) {
            return NextResponse.json({ error: e.message }, { status: 400 });
        }
        // ตรวจจับ Error P2028 เพิ่มเติม
        if (e.code === 'P2028') {
             return NextResponse.json({ error: 'Transaction หมดเวลา, กรุณาลองอีกครั้ง' }, { status: 504 });
        }
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเบิกของ' }, { status: 500 });
    }
}

