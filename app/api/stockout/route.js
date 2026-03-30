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

        const { uid: userId, sid: storeId } = session;

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
            // 1) สร้าง batch เบิกออก 1 ครั้ง
            const batch = await tx.batch.create({
                data: {
                    type: 'STOCK_OUT',
                    user_id: userId,
                    description: description || `Stock-out at ${outTime.toLocaleString('th-TH')}`,
                },
            });

            // 2) วนทีละ item ที่ผู้ใช้เบิก
            for (const item of items) {
                const ingredientId = Number(item.ingredient_id);
                const requestQty = Number(item.quantity);

                if (!ingredientId || !requestQty || requestQty <= 0) {
                    throw new Error('ข้อมูลรายการเบิกไม่ถูกต้อง');
                }

                // 3) หา stock ของวัตถุดิบนี้ทุก lot ที่ยังเหลือ > 0
                const inventories = await tx.ingredient_now.findMany({
                    where: {
                        ingredient_id: ingredientId,
                        quantity: { gt: 0 },
                        batch: {
                            user: {
                                store_id: storeId,
                            },
                        },
                    },
                    include: {
                        batch: {
                            include: {
                                expiry: true, // expiry_tack[]
                            },
                        },
                        ingredient: {
                            select: { name: true },
                        },
                    },
                });

                // 4) จับ expiry ของ lot นี้สำหรับ ingredient นี้ แล้ว sort FEFO
                const lots = inventories
                    .map((inv) => {
                        const expiryRow = inv.batch?.expiry?.find(
                            (e) => e.ingredient_id === ingredientId
                        );

                        return {
                            inventory_id: inv.inventory_id,
                            batch_id: inv.batch_id,
                            ingredient_id: inv.ingredient_id,
                            quantity: Number(inv.quantity),
                            expiry_date: expiryRow?.expiry_date
                                ? new Date(expiryRow.expiry_date)
                                : null,
                            ingredient_name: inv.ingredient?.name || `ID ${ingredientId}`,
                        };
                    })
                    .sort((a, b) => {
                        const aTime = a.expiry_date ? a.expiry_date.getTime() : Number.MAX_SAFE_INTEGER;
                        const bTime = b.expiry_date ? b.expiry_date.getTime() : Number.MAX_SAFE_INTEGER;
                        return aTime - bTime;
                    });

                const totalAvailable = lots.reduce((sum, lot) => sum + lot.quantity, 0);

                if (totalAvailable < requestQty) {
                    const ingredientName = lots[0]?.ingredient_name || `ID ${ingredientId}`;
                    throw new Error(
                        `สินค้าไม่พอ: '${ingredientName}' (ต้องการ ${requestQty} แต่มี ${totalAvailable})`
                    );
                }

                // 5) ตัด stock ทีละ lot ตาม FEFO
                let remain = requestQty;

                for (const lot of lots) {
                    if (remain <= 0) break;

                    const deductQty = Math.min(remain, lot.quantity);

                    await tx.ingredient_now.update({
                        where: {
                            inventory_id: lot.inventory_id,
                        },
                        data: {
                            quantity: {
                                decrement: deductQty,
                            },
                            last_update: outTime,
                        },
                    });

                    remain -= deductQty;
                }

                // 6) บันทึก stockout รวม 1 แถวต่อ 1 item ที่ผู้ใช้เบิก
                const newStockout = await tx.stockout.create({
                    data: {
                        batch_id: batch.batch_id,
                        ingredient_id: ingredientId,
                        quantity: requestQty,
                        unit_id: item.unit_id,
                        out_date: outTime,
                        user_id: userId,
                    },
                });

                // 7) บันทึก history
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
            timeout: 30000,
        });

        return NextResponse.json(
            { message: 'เบิกของสำเร็จ', batchId: newBatch.batch_id },
            { status: 201 }
        );
    } catch (e) {
        console.error('--- STOCKOUT ERROR ---', e);

        if (typeof e?.message === 'string' && e.message.startsWith('สินค้าไม่พอ:')) {
            return NextResponse.json({ error: e.message }, { status: 400 });
        }

        if (e.code === 'P2028') {
            return NextResponse.json(
                { error: 'Transaction หมดเวลา, กรุณาลองอีกครั้ง' },
                { status: 504 }
            );
        }

        return NextResponse.json(
            { error: e?.message || 'เกิดข้อผิดพลาดในการเบิกของ' },
            { status: 500 }
        );
    }
}