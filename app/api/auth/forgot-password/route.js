    import { NextResponse } from 'next/server';
    import { PrismaClient } from '@prisma/client';
    import crypto from 'crypto';
    import { sendPasswordResetEmail } from '../../../../lib/email'; // ปรับ path ให้ถูกต้อง

    const prisma = new PrismaClient();

    export async function POST(request) {
        try {
            const body = await request.json();
            const { email } = body;

            if (!email) {
                return NextResponse.json({ message: 'กรุณากรอกอีเมล' }, { status: 400 });
            }

            // 1. ค้นหาผู้ใช้จากอีเมล
            const user = await prisma.user.findUnique({ where: { email } });

            // 2. เพื่อความปลอดภัย, แม้ไม่พบผู้ใช้ เราก็ตอบกลับเหมือนว่าสำเร็จ
            if (!user) {
                return NextResponse.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้แล้ว' }, { status: 200 });
            }

            // 3. สร้าง Reset Token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const passwordResetToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

            // 4. กำหนดเวลาหมดอายุ (10 นาที)
            const passwordResetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

            // 5. บันทึก Token ที่เข้ารหัสแล้วลงฐานข้อมูล
            await prisma.user.update({
                where: { email },
                data: {
                    passwordResetToken,
                    passwordResetTokenExpiry,
                },
            });

            // 6. สร้าง URL และส่งอีเมล
            const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
            
            await sendPasswordResetEmail({
                to: user.email,
                name: user.name,
                url: resetUrl,
            });

            return NextResponse.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้แล้ว' }, { status: 200 });

        } catch (error) {
            console.error('Forgot Password Error:', error);
            return NextResponse.json({ message: 'เกิดข้อผิดพลาดบางอย่าง' }, { status: 500 });
        }
    }