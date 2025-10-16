import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request) {
    try {
        const body = await request.json();
        console.log('[API Received Body]:', body); // <-- Debug: ดูข้อมูลที่ได้รับ

        const { token, password } = body;
        console.log('[API Token]:', token);       // <-- Debug: ดู Token
        console.log('[API Password]:', password); // <-- Debug: ดู Password

        if (!token || !password) {
            return NextResponse.json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
        }

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        console.log('[API Hashed Token]:', hashedToken); // <-- Debug: ดู Token ที่เข้ารหัสแล้ว

        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: hashedToken,
                passwordResetTokenExpiry: {
                    gt: new Date(),
                },
            },
        });
        console.log('[Prisma Query Result]:', user); // <-- Debug: ดูผลการค้นหาผู้ใช้

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