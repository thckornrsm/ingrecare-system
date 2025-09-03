import { prisma } from '@/lib/prisma';

// ตรวจความถูกต้อง จังหวัด-อำเภอ-ตำบล
async function validateAddress({ provinceId, districtId, subdistrictId }) {
  if (districtId && provinceId) {
    const dist = await prisma.district.findUnique({ where: { id: Number(districtId) } });
    if (!dist || dist.provinceId !== Number(provinceId)) {
      return { ok: false, error: 'อำเภอไม่อยู่ในจังหวัดที่เลือก' };
    }
  }
  if (subdistrictId && districtId) {
    const sub = await prisma.subdistrict.findUnique({ where: { id: Number(subdistrictId) } });
    if (!sub || sub.districtId !== Number(districtId)) {
      return { ok: false, error: 'ตำบลไม่อยู่ในอำเภอที่เลือก' };
    }
  }
  return { ok: true };
}

// ดึงชื่อมาเก็บ snapshot (ถ้ามีฟิลด์ *_name_th)
async function getNames({ provinceId, districtId, subdistrictId }) {
  const [p, d, s] = await Promise.all([
    provinceId ? prisma.province.findUnique({ where: { id: Number(provinceId) } }) : null,
    districtId ? prisma.district.findUnique({ where: { id: Number(districtId) } }) : null,
    subdistrictId ? prisma.subdistrict.findUnique({ where: { id: Number(subdistrictId) } }) : null,
  ]);
  return {
    province_name_th: p?.name_th ?? null,
    district_name_th: d?.name_th ?? null,
    subdistrict_name_th: s?.name_th ?? null,
  };
}

// POST = สร้างร้านใหม่
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, address, phone, email, provinceId, districtId, subdistrictId } = body ?? {};

    if (!name) {
      return new Response(JSON.stringify({ error: 'ต้องระบุชื่อร้าน' }), { status: 400 });
    }

    // ตรวจอีเมลซ้ำ
    if (email) {
      const existed = await prisma.store.findUnique({ where: { email } });
      if (existed) {
        return new Response(JSON.stringify({ error: 'อีเมลร้านนี้มีอยู่แล้ว' }), { status: 409 });
      }
    }

    // ตรวจความถูกต้องจังหวัด-อำเภอ-ตำบล
    const valid = await validateAddress({ provinceId, districtId, subdistrictId });
    if (!valid.ok) {
      return new Response(JSON.stringify({ error: valid.error }), { status: 400 });
    }

    // ✅ หา zipcode จาก subdistrictId
    let finalZipcode = null;
    if (subdistrictId) {
      const sub = await prisma.subdistrict.findUnique({
        where: { id: Number(subdistrictId) },
        select: { zipcode: true },
      });
      finalZipcode = sub?.zipcode ?? null;
    }

    // ดึงชื่อ snapshot
    const names = await getNames({ provinceId, districtId, subdistrictId });

    const store = await prisma.store.create({
      data: {
        name,
        address: address ?? null,
        phone: phone ?? null,
        email: email ?? null,
        provinceId: provinceId ?? null,
        districtId: districtId ?? null,
        subdistrictId: subdistrictId ?? null,
        zipcode: finalZipcode,
        ...names,
      },
      select: {
        store_id: true,
        name: true,
        address: true,
        phone: true,
        email: true,
        province_name_th: true,
        district_name_th: true,
        subdistrict_name_th: true,
        zipcode: true,
      },
    });

    return new Response(JSON.stringify({ store }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'สร้างร้านไม่สำเร็จ' }), { status: 500 });
  }
}

// GET = ดึงรายการร้านทั้งหมด
export async function GET() {
  const stores = await prisma.store.findMany({
    orderBy: { store_id: 'asc' },
    select: {
      store_id: true,
      name: true,
      email: true,
      province_name_th: true,
      district_name_th: true,
      subdistrict_name_th: true,
      zipcode: true,
    },
  });
  return Response.json({ stores });
}
