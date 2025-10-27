import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySession } from "@/utils/auth";

/**
 * PUT: อัปเดตชื่อ/หมวดหมู่/หน่วยนับของวัตถุดิบ
 * body รองรับ:
 * {
 *   name?: string,
 *   category_id?: number | string,     // ถ้าส่งมาเป็น string จะลองแปลงเป็นตัวเลขก่อน
 *   category_name?: string,            // หรือส่งเป็นชื่อหมวด
 *   unit_id?: number | string,         // เช่นเดียวกัน
 *   unit_name?: string,                // หรือส่งเป็นชื่อหน่วย
 *   cascadeUnit?: boolean              // true = sync unit ไป stockin/stockout/inventory
 * }
 */
export async function PUT(request, { params }) {
  try {
    const token = cookies().get("token")?.value;
    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const ingredientId = Number(params.id);
    if (!Number.isFinite(ingredientId)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    let {
      name,
      category_id,
      category_name,
      unit_id,
      unit_name,
      cascadeUnit,
    } = body || {};

    // ---------- normalize ids ----------
    // ถ้า category_id เป็น string ตัวเลข → แปลงเป็น number
    if (typeof category_id === "string" && category_id.trim() !== "") {
      const n = Number(category_id);
      category_id = Number.isFinite(n) ? n : undefined;
    }
    if (typeof unit_id === "string" && unit_id.trim() !== "") {
      const n = Number(unit_id);
      unit_id = Number.isFinite(n) ? n : undefined;
    }

    // หา categoryId จากชื่อถ้ายังไม่มี
    let finalCategoryId = Number.isFinite(category_id) ? Number(category_id) : null;
    if (!finalCategoryId && typeof category_name === "string" && category_name.trim()) {
      const cat = await prisma.categories.findFirst({
        where: { category_name: category_name.trim() },
        select: { category_id: true },
      });
      if (!cat) return NextResponse.json({ error: "ไม่พบหมวดหมู่ตามชื่อที่ระบุ" }, { status: 400 });
      finalCategoryId = cat.category_id;
    }

    // หา unitId จากชื่อถ้ายังไม่มี
    let finalUnitId = Number.isFinite(unit_id) ? Number(unit_id) : null;
    if (!finalUnitId && typeof unit_name === "string" && unit_name.trim()) {
      const unit = await prisma.units.findFirst({
        where: { unit_name: unit_name.trim() },
        select: { unit_id: true },
      });
      if (!unit) return NextResponse.json({ error: "ไม่พบหน่วยนับตามชื่อที่ระบุ" }, { status: 400 });
      finalUnitId = unit.unit_id;
    }

    // ---------- update ----------
    const updated = await prisma.$transaction(async (tx) => {
      const exist = await tx.ingredients.findUnique({
        where: { ingredient_id: ingredientId },
        select: { ingredient_id: true },
      });
      if (!exist) throw new Error("NOT_FOUND");

      const data = {};
      if (typeof name === "string" && name.trim()) data.name = name.trim();
      if (finalCategoryId) data.category_id = finalCategoryId;
      if (finalUnitId) data.unit_id = finalUnitId;

      const ing = await tx.ingredients.update({
        where: { ingredient_id: ingredientId },
        data,
        include: { category: true, unit: true },
      });

      // sync หน่วยไปตารางที่เกี่ยวข้องถ้าต้องการ
      if (finalUnitId && cascadeUnit) {
        await tx.ingredient_now.updateMany({
          where: { ingredient_id: ingredientId },
          data: { unit_id: finalUnitId },
        });
        await tx.stockin.updateMany({
          where: { ingredient_id: ingredientId },
          data: { unit_id: finalUnitId },
        });
        await tx.stockout.updateMany({
          where: { ingredient_id: ingredientId },
          data: { unit_id: finalUnitId },
        });
      }

      return ing;
    });

    return NextResponse.json({
      message: "อัปเดตวัตถุดิบสำเร็จ",
      ingredient: {
        id: updated.ingredient_id,
        name: updated.name,
        category: updated.category?.category_name ?? null,
        unit: updated.unit?.unit_name ?? null,
      },
    });
  } catch (e) {
    if (e?.message === "NOT_FOUND") {
      return NextResponse.json({ error: "ไม่พบวัตถุดิบ" }, { status: 404 });
    }
    console.error("--- PUT /ingredients/[id] ERROR ---", e);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการอัปเดต" }, { status: 500 });
  }
}

/**
 * DELETE: ลบวัตถุดิบ (ป้องกันถ้ามีการอ้างอิงอยู่)
 */
export async function DELETE(request, { params }) {
  try {
    const token = cookies().get("token")?.value;
    const session = await verifySession(token);
    if (!session) {
      return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const ingredientId = Number(params.id);
    if (!Number.isFinite(ingredientId)) {
      return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
    }

    // ถ้ามีเบิกแม้ครั้งเดียว ห้ามลบ
    const stockoutCount = await prisma.stockout.count({
      where: { ingredient_id: ingredientId },
    });
    if (stockoutCount > 0) {
      return NextResponse.json(
        { error: "ลบไม่ได้: วัตถุดิบมีประวัติการเบิกแล้ว" },
        { status: 409 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // หา stockin_ids เพื่อใช้ลบ history (action_type=stockin) ก่อน
      const stockins = await tx.stockin.findMany({
        where: { ingredient_id: ingredientId },
        select: { stockin_id: true },
      });
      const stockinIds = stockins.map((s) => s.stockin_id);

      // 1) ลบ history ที่ผูกกับ stockin ของวัตถุดิบนี้ (กัน FK)
      if (stockinIds.length > 0) {
        await tx.history.deleteMany({
          where: { stockin_id: { in: stockinIds } },
        });
      }

      // 2) ลบ expiry_tack ของวัตถุดิบนี้
      await tx.expiry_tack.deleteMany({
        where: { ingredient_id: ingredientId },
      });

      // 3) ลบ inventory ปัจจุบัน (ingredient_now)
      await tx.ingredient_now.deleteMany({
        where: { ingredient_id: ingredientId },
      });

      // 4) ลบ stockin ของวัตถุดิบนี้
      await tx.stockin.deleteMany({
        where: { ingredient_id: ingredientId },
      });

      // (ไม่ต้องยุ่งกับ stockout เพราะบล็อคไปแล้ว)

      // 5) ลบตัววัตถุดิบ
      await tx.ingredients.delete({
        where: { ingredient_id: ingredientId },
      });
    });

    return NextResponse.json({ message: "ลบวัตถุดิบสำเร็จ" });
  } catch (e) {
    // ถ้า FK ยังขวางอยู่ ให้เห็น error ง่ายขึ้น
    console.error("--- DELETE /ingredients/[id] ERROR ---");
    console.error(e?.message || e);
    if (e?.meta?.cause) console.error("CAUSE:", e.meta.cause);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการลบ" }, { status: 500 });
  }
}