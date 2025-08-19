import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// กำหนด named export สำหรับ HTTP GET สำหรับจังหวัด
export async function GET() {
  try {
    const provinces = await prisma.province.findMany({
      orderBy: {
        id: 'asc', // เรียงตาม id จากน้อยไปหามาก
      },
      include: {
        districts: true, // ดึงข้อมูลอำเภอที่เชื่อมโยงกับจังหวัด
      }
    });

    // ส่งข้อมูลจังหวัดที่จัดเรียงแล้ว
    return new Response(JSON.stringify(provinces), {
      status: 200,
    });
  } catch (error) {
    // หากเกิดข้อผิดพลาด ส่งข้อผิดพลาดกลับไป
    return new Response(
      JSON.stringify({ error: 'Failed to fetch provinces' }),
      { status: 500 }
    );
  }
}
