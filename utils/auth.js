import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET;
const cookieName = process.env.COOKIE_NAME || 'auth';

export function signSession(payload, { expSeconds = 60 * 60 * 24 * 7 } = {}) {
  return jwt.sign(payload, secret, { expiresIn: expSeconds });
}

export function verifySession(token) {
  return jwt.verify(token, secret);
}

export function cookieHeader(token, { maxAge = 60 * 60 * 24 * 7 } = {}) {
  const parts = [
    `${cookieName}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
    `Max-Age=${maxAge}`,
  ].filter(Boolean);
  return parts.join('; ');
}

export function clearCookieHeader() {
  return `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;
}

export function readCookie(req) {
  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(new RegExp(`${cookieName}=([^;]+)`));
  return m?.[1] || null;
}
