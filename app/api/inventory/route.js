import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * @description ดึงข้อมูลสต็อกวัตถุดิบคงเหลือ (ingredient_now) สามารถกรองตามหมวดหมู่ได้
 * @param {Request} req
 * @returns {NextResponse}
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    const whereClause = {};

    // ถ้ามีการระบุ categoryId, ให้กรองตาม category_id ของ ingredient ที่ผูกกันอยู่
    if (categoryId) {
      whereClause.ingredient = {
        category_id: parseInt(categoryId),
      };
    }

    const inventory = await prisma.ingredient_now.findMany({
      where: whereClause,
      include: {
        ingredient: {
          select: {
            name: true,
            category: {
              select: {
                category_id: true,
                category_name: true,
              },
            },
          },
        },
        unit: {
          select: {
            unit_name: true,
          },
        },
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
