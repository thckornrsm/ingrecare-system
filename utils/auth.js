// utils/auth.js
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in your .env.local file');
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

// ฟังก์ชันสร้าง Token ตอน Login
export async function createSession(uid) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await new SignJWT({ uid })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .setIssuedAt(new Date())
    .sign(secretKey);
  return session;
}

// ฟังก์ชันตรวจสอบ Token (ทำงานได้ใน Middleware)
export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload; // คืนค่า { uid, iat, exp }
  } catch (e) {
    return null;
  }
}

export function readCookie() {
    const cookieStore = cookies();
    // ❗️ ตรวจสอบให้แน่ใจว่าชื่อ 'token' ตรงกับที่คุณตั้งไว้ตอน Login
    const token = cookieStore.get('token')?.value; 
    return token;
}