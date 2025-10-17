// app/api/stockin/[id]/route.js

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/utils/auth';

/**
 * @description ลบรายการ Stock In และปรับปรุงสต็อก
 */
export async function DELETE(request, { params }) {
    // ... (โค้ด DELETE method เดิมของคุณ) ...
    try {
        const token = request.cookies.get('token')?.value;
        const session = await verifySession(token);
        if (!session) {
            return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
        }

        const { id } = params;
        const stockinId = parseInt(id);

        if (isNaN(stockinId)) {
            return NextResponse.json({ error: 'ID ไม่ถูกต้อง' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const stockinToDelete = await tx.stockin.findUnique({
                where: { stockin_id: stockinId },
            });

            if (!stockinToDelete) {
                throw new Error('ไม่พบรายการนำเข้าที่ต้องการลบ');
            }

            const currentInventory = await tx.ingredient_now.findFirst({
                where: { ingredient_id: stockinToDelete.ingredient_id },
            });

            if (!currentInventory || currentInventory.quantity < stockinToDelete.quantity) {
                throw new Error('ไม่สามารถลบรายการได้เนื่องจากสต็อกปัจจุบันไม่เพียงพอ');
            }

            await tx.ingredient_now.update({
                where: { inventory_id: currentInventory.inventory_id },
                data: {
                    quantity: { decrement: stockinToDelete.quantity },
                },
            });

            await tx.history.deleteMany({
                where: { stockin_id: stockinId },
            });

            const deletedStockin = await tx.stockin.delete({
                where: { stockin_id: stockinId },
            });

            return deletedStockin;
        });

        return NextResponse.json({ message: `ลบรายการ #${result.stockin_id} สำเร็จ` });

    } catch (e) {
        console.error('--- DELETE STOCKIN ERROR ---', e);
        return NextResponse.json({ error: e.message || 'เกิดข้อผิดพลาดในการลบข้อมูล' }, { status: 500 });
    }
}


/**
 * @description อัปเดตรายการ Stock In และปรับปรุงสต็อกตามการเปลี่ยนแปลงจำนวน
 */
export async function PUT(request, { params }) {
    try {
        // 1. ตรวจสอบสิทธิ์
        const token = request.cookies.get('token')?.value;
        const session = await verifySession(token);
        if (!session) {
            return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
        }

        const stockinId = parseInt(params.id);
        if (isNaN(stockinId)) {
            return NextResponse.json({ error: 'ID ไม่ถูกต้อง' }, { status: 400 });
        }

        // 2. รับและตรวจสอบข้อมูลจาก Frontend
        const { name, quantity, received_date, expiry_date } = await request.json();
        const updatedQuantity = parseFloat(quantity);

        if (!name || isNaN(updatedQuantity) || updatedQuantity <= 0 || !received_date || !expiry_date) {
            return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง' }, { status: 400 });
        }

        // 3. ใช้ Transaction เพื่อความปลอดภัยของข้อมูล
        const result = await prisma.$transaction(async (tx) => {
            // ค้นหารายการ Stockin เดิม
            const oldStockin = await tx.stockin.findUnique({
                where: { stockin_id: stockinId },
                include: { ingredient: true }
            });

            if (!oldStockin) {
                throw new Error('ไม่พบรายการนำเข้าที่ต้องการแก้ไข');
            }

            // --- ส่วนจัดการการเปลี่ยนชื่อ ---
            if (name.trim() !== oldStockin.ingredient.name) {
                const newName = name.trim();
                
                // ตรวจสอบว่าชื่อใหม่ซ้ำกับวัตถุดิบอื่นหรือไม่
                const existingIngredient = await tx.ingredients.findFirst({
                    where: {
                        name: newName,
                        NOT: { ingredient_id: oldStockin.ingredient_id }
                    }
                });

                if (existingIngredient) {
                    throw new Error(`ชื่อ '${newName}' มีอยู่แล้วในระบบ`);
                }

                // อัปเดตชื่อในตาราง ingredients (ตารางหลัก)
                await tx.ingredients.update({
                    where: { ingredient_id: oldStockin.ingredient_id },
                    data: { name: newName }
                });
            }
            
            // --- ส่วนจัดการการเปลี่ยนจำนวน และอัปเดตสต็อก ---
            const quantityDifference = updatedQuantity - oldStockin.quantity;

            if (quantityDifference !== 0) {
                const currentInventory = await tx.ingredient_now.findFirst({
                    where: { ingredient_id: oldStockin.ingredient_id },
                });

                if (!currentInventory) {
                    throw new Error('ไม่พบข้อมูลสต็อกปัจจุบันของวัตถุดิบนี้');
                }

                const newStockQuantity = currentInventory.quantity + quantityDifference;
                if (newStockQuantity < 0) {
                    throw new Error('ไม่สามารถแก้ไขได้ เนื่องจากสต็อกจะติดลบ');
                }

                await tx.ingredient_now.update({
                    where: { inventory_id: currentInventory.inventory_id },
                    data: { quantity: newStockQuantity },
                });
            }

            // --- อัปเดตรายการ Stockin หลัก ---
            const updatedStockin = await tx.stockin.update({
                where: { stockin_id: stockinId },
                data: {
                    quantity: updatedQuantity,
                    received_date: new Date(received_date),
                    expiry_date: new Date(expiry_date),
                },
                include: {
                    ingredient: { include: { category: true } },
                    unit: true
                }
            });
            
            return updatedStockin;
        });

        // 4. จัดรูปแบบข้อมูลเพื่อส่งกลับให้ Frontend
        const formattedResult = {
            id: result.stockin_id,
            name: result.ingredient.name,
            received_date: result.received_date,
            expiry_date: result.expiry_date,
            category: result.ingredient.category.category_name,
            quantity: result.quantity,
            unit: result.unit.unit_name,
        };

        return NextResponse.json({ message: `อัปเดตรายการ #${formattedResult.id} สำเร็จ`, updatedItem: formattedResult });

    } catch (e) {
        console.error('--- PUT STOCKIN ERROR ---', e);
        return NextResponse.json({ error: e.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' }, { status: 500 });
    }
}