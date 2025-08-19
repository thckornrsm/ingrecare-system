import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    // ดึง districtId จาก query string
    const districtId = req.nextUrl.searchParams.get('districtId');

    // ตรวจสอบว่ามีการส่ง districtId หรือไม่
    if (!districtId) {
      return new Response(
        JSON.stringify({ error: 'districtId is required' }),
        { status: 400 }
      );
    }

    console.log('Received districtId:', districtId);  // ตรวจสอบค่าของ districtId

    // ดึงข้อมูลตำบลที่เกี่ยวข้องกับ districtId
    const subdistricts = await prisma.subdistrict.findMany({
      where: {
        districtId: parseInt(districtId), // แปลง districtId เป็น Integer
      },
      orderBy: {
        id: 'asc', // เรียงตาม id จากน้อยไปหามาก
      }
    });

    // หากไม่พบข้อมูลตำบล
    if (subdistricts.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subdistricts found for the given districtId' }),
        { status: 404 }
      );
    }

    // ส่งข้อมูลตำบลที่จัดเรียงแล้ว
    return new Response(JSON.stringify(subdistricts), {
      status: 200,
    });
  } catch (error) {
    // หากเกิดข้อผิดพลาด ส่งข้อผิดพลาดกลับไป
    console.error(error); // พิมพ์ข้อผิดพลาดใน console
    return new Response(
      JSON.stringify({ error: 'Failed to fetch subdistricts' }),
      { status: 500 }
    );
  }
}
