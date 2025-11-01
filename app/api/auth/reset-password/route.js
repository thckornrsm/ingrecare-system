// app/api/auth/reset-password/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';        // ใช้ Node runtime
export const dynamic = 'force-dynamic'; // กัน cache บน Vercel

const prisma = new PrismaClient();

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const rawToken = body?.token;
    const password = body?.password;

    if (!rawToken || !password) {
      return NextResponse.json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    // กันช่องว่าง/บรรทัดจากลิงก์
    const token = String(rawToken).trim();
    const hashed = sha256(token);
    const now = new Date();

    // 1) หาแบบเก็บ "แฮช" ใน DB
    let user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashed,
        passwordResetTokenExpiry: { gt: now },
      },
    });

    // 2) ถ้าไม่เจอ ลองหาแบบเก็บ "โทเคนดิบ"
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetTokenExpiry: { gt: now },
        },
      });
    }

    if (!user) {
      return NextResponse.json({ message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' }, { status: 200 });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดบางอย่าง' }, { status: 500 });
  }
}
