import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession } from '@/utils/auth';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
        }

        // 1. สร้าง Token หลังจากตรวจสอบผู้ใช้สำเร็จ
        const token = await createSession(user.user_id);

        // 2. สร้าง Response และตั้งค่า Cookie
        const response = NextResponse.json({
            user: {
                user_id: user.user_id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        });

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 วัน
            path: '/',
        });

        // 3. ส่ง Response ที่มี Cookie กลับไป
        return response;

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' }, { status: 500 });
    }
}