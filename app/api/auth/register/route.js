import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

const ROLES = new Set(['manager', 'kitchen_staff']);

export async function POST(req) {
  try {
    const body = await req.json();
    const user = body?.user ?? {};
    const store = body?.store ?? {};

    const { email, password, name, role, store_id } = user;
    const { name: storeName, address, phone, email: storeEmail } = store;

    // 1) ตรวจ input
    if (!email || !password || !role) {
      return new Response(JSON.stringify({ error: 'email, password, role จำเป็นต้องมี' }), { status: 400 });
    }
    if (!ROLES.has(role)) {
      return new Response(JSON.stringify({ error: 'role ไม่ถูกต้อง' }), { status: 400 });
    }

    // 2) อีเมลซ้ำ?
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return new Response(JSON.stringify({ error: 'อีเมลนี้มีอยู่แล้ว' }), { status: 409 });
    }

    // 3) จัดการ store
    let finalStoreId = store_id ?? null;

    if (!finalStoreId) {
      // หา store จาก email
      let s = null;
      if (storeEmail) {
        s = await prisma.store.findUnique({ where: { email: storeEmail } });
      }

      if (!s) {
        if (!storeName) {
          return new Response(JSON.stringify({ error: 'ไม่มี store_id และไม่มีชื่อร้านสำหรับสร้างใหม่' }), { status: 400 });
        }
        s = await prisma.store.create({
          data: {
            name: storeName,
            address: address ?? null,
            phone: phone ?? null,
            email: storeEmail ?? null,
          },
        });
      }
      finalStoreId = s.store_id;
    } else {
      // ตรวจว่า store_id มีจริง
      const exists = await prisma.store.findUnique({ where: { store_id: finalStoreId } });
      if (!exists) {
        return new Response(JSON.stringify({ error: 'store_id ไม่ถูกต้อง' }), { status: 400 });
      }
    }

    // 4) hash password
    const hashed = await bcrypt.hash(password, 10);

    // 5) สร้าง user
    const created = await prisma.user.create({
      data: {
        email,
        name: name ?? email.split('@')[0],
        password: hashed,
        role,
        store_id: finalStoreId,
      },
      select: { user_id: true, email: true, name: true, role: true, store_id: true },
    });

    return new Response(JSON.stringify({ user: created }), { status: 201 });
  } catch (err) {
    console.error('REGISTER ERROR:', err);

    if (err.code === 'P2002') {
      return new Response(JSON.stringify({ error: 'อีเมลซ้ำ (unique constraint)' }), { status: 409 });
    }
    if (err.code === 'P2003') {
      return new Response(JSON.stringify({ error: 'store_id ไม่ถูกต้อง (foreign key)' }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: 'สมัครผู้ใช้ไม่สำเร็จ' }), { status: 500 });
  }
}
