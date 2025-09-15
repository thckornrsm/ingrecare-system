import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { signSession, cookieHeader } from '@/utils/auth';
import { Cookie } from 'next/font/google';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return Response.json({ error: 'email และ password จำเป็น' }, { status: 400 });
    }

    const emailNorm = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNorm)) {
      return Response.json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({
      where: { email: emailNorm },
      select: { user_id: true, email: true, name: true, password: true, role: true, store_id: true },
    });
    if (!user) {
      return Response.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return Response.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const token = signSession({
      uid: user.user_id,
      role: user.role,
      sid: user.store_id,
      email: user.email,
    });
    const cookie = `token=${token};Path=/; HttpOnly; Max-Age=3600; SameSite=Lax`;

    return new Response(
      JSON.stringify({
        user: {
          user_id: user.user_id,
          email: user.email,
          name: user.name,
          role: user.role,
          store_id: user.store_id,
          token,
        },
      }),
      {
        status: 200,
        headers: { 'Set-Cookie': cookie },
      }
    );
  } catch (e) {
    console.error('LOGIN_ERROR', e);
    return Response.json({ error: 'ล็อกอินไม่สำเร็จ' }, { status: 500 });
  }
}
