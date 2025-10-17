import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// ตรวจสอบให้แน่ใจว่าชื่อ JWT_SECRET ตรงกับในไฟล์ .env ของคุณ
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * ✨ แก้ไขตรงนี้: รับ payload เป็น object { uid, sid }
 */
export async function createSession(payload) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  return await new SignJWT(payload) // <-- ใช้ payload ที่รับมาโดยตรง
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(secretKey);
}

/**
 * ✨ แก้ไขตรงนี้: เพื่อให้คืนค่า payload ทั้งหมด
 */
export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });
    return payload; // คืนค่า { uid, sid, iat, exp }
  } catch (e) {
    console.error("JWT Verification failed:", e.message);
    return null;
  }
}

// ฟังก์ชันนี้ไม่ต้องแก้ไข
export function readCookie() {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value; 
    return token;
}