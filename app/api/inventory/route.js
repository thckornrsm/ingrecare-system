import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/utils/auth';

/**
 * @description ดึงข้อมูลสต็อกวัตถุดิบคงเหลือล่าสุดจากตาราง ingredient_now
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

        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');

        // 1. สร้างเงื่อนไขการค้นหา (where clause)
        const whereClause = {
            // **แก้ไข:** ใช้ความสัมพันธ์ที่ถูกต้องผ่าน Batch
            batch: {
                user: {
                    store_id: storeId,
                }
            },
            // แสดงเฉพาะวัตถุดิบที่ยังมีของเหลืออยู่
            quantity: {
                gt: 0,
            },
        };

        // 2. ถ้ามีการระบุ categoryId, ให้เพิ่มเงื่อนไขการกรอง
        if (categoryId && categoryId !== 'ทั้งหมด') {
            whereClause.ingredient = {
                category_id: parseInt(categoryId),
            };
        }

        // 3. ดึงข้อมูลจาก ingredient_now ซึ่งเป็นยอดล่าสุดเสมอ
        const inventory = await prisma.ingredient_now.findMany({
            where: whereClause,
            include: {
                ingredient: {
                    include: {
                        category: true,
                    },
                },
                unit: true,
            },
            orderBy: {
                last_update: 'desc', // แสดงรายการที่อัปเดตล่าสุดก่อน
            },
        });

        return NextResponse.json(inventory);
    } catch (error) {
        console.error('--- GET INVENTORY ERROR ---', error);
        return NextResponse.json(
            { error: 'ไม่สามารถดึงข้อมูลสต็อกได้' },
            { status: 500 }
        );
    }
}

