import { NextResponse } from 'next/server';

export async function POST() {
    // สร้าง Response
    const response = NextResponse.json({ message: 'ออกจากระบบสำเร็จ' });

    // ใช้ helper เพื่อสั่งลบ cookie
    response.cookies.set('token', '', {
        httpOnly: true,
        expires: new Date(0), // ตั้งเวลาหมดอายุเป็นอดีต
        path: '/',
    });

    return response;
}