// middleware.js
import { NextResponse } from 'next/server';
import { verifySession } from '@/utils/auth';

// 1. กำหนด Path ที่ไม่ต้อง Login ก็เข้าได้
const publicRoutes = ['/login', '/forget-password', '/reset-password'];

// 2. กำหนด Path ที่ต้อง Login (ยกเว้น /dashboard)
const protectedRoutes = [
    '/dashboard',  
    '/statistics',
    '/stockin',
    '/stockout',
    '/allingredient',
    '/allexpired',
    '/allstockin',
    '/allstockout',
];

export async function middleware(req) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const session = await verifySession(token);

  // 3. LOGIC การป้องกัน (เหมือนเดิม)
  // ถ้าไม่มี Session และกำลังจะเข้าไปยังหน้าที่ต้อง Login -> ส่งไปหน้า Login
  if (!session && protectedRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // ถ้ามี Session และกำลังจะเข้าไปยังหน้าที่ไม่ต้อง Login -> ส่งไปหน้า Dashboard
  if (session && publicRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // ถ้าไม่เข้าเงื่อนไขไหนเลย ก็ให้ไปต่อได้
  return NextResponse.next();
}

// Config: ไม่ต้องแก้ไข
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};