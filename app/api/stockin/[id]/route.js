import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/utils/auth';
import { cookies } from 'next/headers';

/**
 * @description ลบรายการ Stock In และปรับปรุงสต็อก
 */
export async function DELETE(request, { params }) {
    try {
        const token = cookies().get('token')?.value;
        const session = await verifySession(token);
        if (!session) {
            return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
        }

        const stockinId = parseInt(params.id);
        if (isNaN(stockinId)) {
            return NextResponse.json({ error: 'ID ไม่ถูกต้อง' }, { status: 400 });
        }

        // --- DATABASE TRANSACTION ---
        await prisma.$transaction(async (tx) => {
            // 1. ค้นหารายการนำเข้าที่จะลบ
            const stockinToDelete = await tx.stockin.findUnique({
                where: { stockin_id: stockinId },
            });

            if (!stockinToDelete) {
                throw new Error('NOT_FOUND');
            }
            
            const ingredientId = stockinToDelete.ingredient_id;

            // 2. ตรวจสอบสต็อกปัจจุบันก่อน
            const currentInventory = await tx.ingredient_now.findFirst({
                where: { ingredient_id: ingredientId },
            });

            if (!currentInventory || currentInventory.quantity < stockinToDelete.quantity) {
                throw new Error('INSUFFICIENT_STOCK');
            }
            
            // 3. นับจำนวน lot ทั้งหมดของวัตถุดิบนี้
            const totalLots = await tx.stockin.count({
                where: { ingredient_id: ingredientId },
            });

            // 4. แยกตรรกะการทำงาน
            if (totalLots > 1) {
                // --- กรณีมีหลาย lot: ลบเฉพาะ lot นี้ ---
                await tx.ingredient_now.updateMany({
                    where: { ingredient_id: ingredientId },
                    data: { quantity: { decrement: stockinToDelete.quantity } },
                });
                await tx.history.deleteMany({ where: { stockin_id: stockinId } });
                await tx.stockin.delete({ where: { stockin_id: stockinId } });

            } else {
                // --- กรณีเป็น lot สุดท้าย: ลบวัตถุดิบหลักทิ้งไปด้วย ---
                // ตรวจสอบก่อนว่าเคยมีการเบิกจ่ายหรือไม่ ถ้ามี จะลบวัตถุดิบหลักไม่ได้
                const stockoutCount = await tx.stockout.count({
                    where: { ingredient_id: ingredientId },
                });

                if (stockoutCount > 0) {
                    throw new Error('HAS_HISTORY');
                }

                // ถ้าไม่มีประวัติเบิกจ่าย ก็ทำการล้างข้อมูลทั้งหมด
                await tx.history.deleteMany({ where: { stockin_id: stockinId } });
                await tx.stockin.delete({ where: { stockin_id: stockinId } });
                await tx.expiry_tack.deleteMany({ where: { ingredient_id: ingredientId } });
                await tx.ingredient_now.deleteMany({ where: { ingredient_id: ingredientId } });
                await tx.ingredients.delete({ where: { ingredient_id: ingredientId } });
            }
        });

        return NextResponse.json({ message: `ลบรายการ #${stockinId} และอัปเดตสต็อกสำเร็จ` });

    } catch (e) {
        if (e.message === 'NOT_FOUND') {
            return NextResponse.json({ error: 'ไม่พบรายการนำเข้าที่ต้องการลบ' }, { status: 404 });
        }
        if (e.message === 'INSUFFICIENT_STOCK') {
            return NextResponse.json(
                { error: 'ลบไม่ได้ สต็อกปัจจุบันมีน้อยกว่าจำนวนที่นำเข้า (อาจมีการเบิกจ่ายไปแล้ว)' },
                { status: 409 }
            );
        }
        if (e.message === 'HAS_HISTORY') {
             return NextResponse.json(
                { error: 'ลบวัตถุดิบหลักไม่ได้ เนื่องจากมีประวัติการเบิกจ่ายอยู่' },
                { status: 409 }
            );
        }
        console.error('--- DELETE STOCKIN ERROR ---', e);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' }, { status: 500 });
    }
}


/**
 * @description อัปเดตรายการ Stock In และปรับปรุงสต็อก/ข้อมูลหลัก
 */
export async function PUT(request, { params }) {
    try {
        const token = cookies().get('token')?.value;
        const session = await verifySession(token);
        if (!session) {
            return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
        }

        const stockinId = parseInt(params.id);
        if (isNaN(stockinId)) {
            return NextResponse.json({ error: 'ID ไม่ถูกต้อง' }, { status: 400 });
        }

        const { name, quantity, received_date, expiry_date, category, unit } = await request.json();
        const updatedQuantity = parseFloat(quantity);

        if (!name || isNaN(updatedQuantity) || updatedQuantity <= 0 || !received_date || !expiry_date) {
            return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วนหรือไม่ถูกต้อง' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // ดึงข้อมูลเก่า
            const oldStockin = await tx.stockin.findUnique({
                where: { stockin_id: stockinId },
                include: { ingredient: true }
            });

            if (!oldStockin) {
                throw new Error('ไม่พบรายการนำเข้าที่ต้องการแก้ไข');
            }

            const ingredientUpdates = {};
            const stockinUpdates = {};

            // ตรวจสอบและเตรียมข้อมูล category
            if (category) {
                const foundCategory = await tx.categories.findFirst({
                    where: { category_name: category },
                });
                if (!foundCategory) {
                    throw new Error(`ไม่พบหมวดหมู่ที่ชื่อว่า '${category}'`);
                }
                ingredientUpdates.category_id = foundCategory.category_id;
            }

            // ตรวจสอบและเตรียมข้อมูล unit
            if (unit) {
                const foundUnit = await tx.units.findFirst({
                    where: { unit_name: unit },
                });
                if (!foundUnit) {
                    throw new Error(`ไม่พบหน่วยนับที่ชื่อว่า '${unit}'`);
                }
                stockinUpdates.unit_id = foundUnit.unit_id;
                ingredientUpdates.unit_id = foundUnit.unit_id;
            }

            // ตรวจสอบการเปลี่ยนชื่อ
            if (name.trim() !== oldStockin.ingredient.name) {
                ingredientUpdates.name = name.trim();
            }
            
            // อัปเดต ingredient (ถ้ามีการเปลี่ยนแปลง)
            if (Object.keys(ingredientUpdates).length > 0) {
                await tx.ingredients.update({
                    where: { ingredient_id: oldStockin.ingredient_id },
                    data: ingredientUpdates,
                });
            }

            // อัปเดต ingredient_now (ถ้ามีการเปลี่ยนแปลงปริมาณ)
            const quantityDifference = updatedQuantity - oldStockin.quantity;
            if (quantityDifference !== 0) {
                await tx.ingredient_now.updateMany({
                    where: { ingredient_id: oldStockin.ingredient_id },
                    data: { quantity: { increment: quantityDifference } },
                });
            }

            // อัปเดต stockin
            const updatedStockin = await tx.stockin.update({
                where: { stockin_id: stockinId },
                data: {
                    quantity: updatedQuantity,
                    received_date: new Date(received_date),
                    expiry_date: new Date(expiry_date),
                    ...stockinUpdates,
                },
                include: {
                    ingredient: { include: { category: true } },
                    unit: true
                }
            });
            
            return updatedStockin;
        }, {
            maxWait: 5000, // รอ transaction ได้สูงสุด 5 วินาที
            timeout: 10000, // timeout ที่ 10 วินาที
        });

        const formattedResult = {
            id: result.stockin_id,
            name: result.ingredient.name,
            received_date: result.received_date,
            expiry_date: result.expiry_date,
            category: result.ingredient.category.category_name,
            quantity: result.quantity,
            unit: result.unit.unit_name,
        };

        return NextResponse.json({ 
            message: `อัปเดตรายการ #${formattedResult.id} สำเร็จ`, 
            updatedItem: formattedResult 
        });

    } catch (e) {
        if (e.message.startsWith('ไม่พบหมวดหมู่') || e.message.startsWith('ไม่พบหน่วยนับ')) {
            return NextResponse.json({ error: e.message }, { status: 404 });
        }
        if (e.code === 'P2028') {
            return NextResponse.json({ 
                error: 'การทำงานใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง' 
            }, { status: 408 });
        }
        console.error('--- PUT STOCKIN ERROR ---', e);
        return NextResponse.json({ 
            error: e.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' 
        }, { status: 500 });
    }
}

