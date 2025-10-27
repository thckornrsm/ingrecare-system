// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export async function GET(req) {
//   try {
//     // ดึง provinceId จาก query string ใน URL ด้วยวิธีการที่เหมาะสมใน Next.js 13+
//     const provinceId = req.nextUrl.searchParams.get('provinceId');
    
//     // ตรวจสอบว่า provinceId ถูกส่งมาหรือไม่
//     if (!provinceId) {
//       return new Response(
//         JSON.stringify({ error: 'provinceId is required' }),
//         { status: 400 }
//       );
//     }

//     console.log('Received provinceId:', provinceId); // ตรวจสอบค่า provinceId ใน console

//     // ดึงข้อมูลอำเภอที่เกี่ยวข้องกับ provinceId
//     const districts = await prisma.district.findMany({
//       where: {
//         provinceId: parseInt(provinceId), // แปลง provinceId เป็น Integer
//       },
//       orderBy: {
//         id: 'asc', // เรียงตาม id จากน้อยไปหามาก
//       },
//       include: {
//         subdistrict: true, // ดึงข้อมูลตำบลที่เชื่อมโยงกับอำเภอ
//       }
//     });

//     // ส่งข้อมูลอำเภอที่จัดเรียงแล้ว
//     return new Response(JSON.stringify(districts), {
//       status: 200,
//     });
//   } catch (error) {
//     // หากเกิดข้อผิดพลาด ส่งข้อผิดพลาดกลับไป
//     console.error(error); // พิมพ์ข้อผิดพลาดใน console
//     return new Response(
//       JSON.stringify({ error: 'Failed to fetch districts' }),
//       { status: 500 }
//     );
//   }
// }

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const provinceIdStr = req.nextUrl.searchParams.get('provinceId');
    const provinceId = Number(provinceIdStr);
    if (!provinceIdStr || Number.isNaN(provinceId)) {
      return new Response(JSON.stringify({ error: 'provinceId is required (number)' }), { status: 400 });
    }

    const districts = await prisma.district.findMany({
      where: { provinceId },
      orderBy: { name_th: 'asc' },
      select: { id: true, name_th: true }, // ✅ ไม่มี include subdistricts
    });

    return Response.json({ districts });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Failed to fetch districts' }), { status: 500 });
  }
}
