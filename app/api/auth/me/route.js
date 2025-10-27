import { prisma } from '@/lib/prisma';
import { readCookie, verifySession } from '@/utils/auth';

export async function GET(req) {
  try {
    const token = readCookie(req);
    if (!token) return Response.json({ user: null }, { status: 401 });

    const session = verifySession(token); // jwt.verify → { uid, role, ... }
    const user = await prisma.user.findUnique({
      where: { user_id: Number(session.uid) },
      select: {
        user_id: true,
        email: true,
        name: true,
        role: true,
        store_id: true,
        store: {
          select: {
            store_id: true,
            name: true,
            email: true,
            province_name_th: true,
            district_name_th: true,
            subdistrict_name_th: true,
            zipcode: true,
          },
        },
      },
    });
    if (!user) return Response.json({ user: null }, { status: 401 });

    return Response.json({ user });
  } catch (e) {
    console.error('ME_ERROR', e);
    return Response.json({ user: null }, { status: 401 });
  }
}
