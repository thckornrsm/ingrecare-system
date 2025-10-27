// app/api/stores/[id]/route.js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req, { params }) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: 'Invalid store id' }, { status: 400 });
  }

  try {
    const store = await prisma.store.findUnique({
      where: { store_id: id },
      select: {
        store_id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        zipcode: true,
        province_name_th: true,
        district_name_th: true,
        subdistrict_name_th: true,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json(store);
  } catch (e) {
    console.error('STORE_GET_ERROR', e);
    return NextResponse.json({ error: 'Failed to load store' }, { status: 500 });
  }
}
