import { clearCookieHeader } from '@/utils/auth';

export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Set-Cookie': clearCookieHeader() },
  });
}
