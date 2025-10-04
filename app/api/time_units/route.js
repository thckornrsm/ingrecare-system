import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // ดึงข้อมูล time_units ทั้งหมดจากฐานข้อมูล
    const timeUnits = await prisma.time_units.findMany({
      orderBy: {
        unit_id: 'asc', // เรียงตาม ID
      },
    });

    // ส่งข้อมูลกลับไปเป็น JSON
    return NextResponse.json(timeUnits);

  } catch (error) {
    console.error("TIME_UNITS_FETCH_ERROR", error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลหน่วยเวลาได้' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { unit_name } = await req.json();

    if (!unit_name) {
      return NextResponse.json(
        { error: 'กรุณาระบุ unit_name' },
        { status: 400 }
      );
    }

    // สร้างหน่วยเวลาใหม่
    const newTimeUnit = await prisma.time_units.create({
      data: {
        unit_name: unit_name,
      },
    });

    return NextResponse.json(newTimeUnit, { status: 201 });
  } catch (error) {
    console.error("TIME_UNITS_CREATE_ERROR", error);
    return NextResponse.json(
      { error: 'ไม่สามารถสร้างหน่วยเวลาได้' },
      { status: 500 }
    );
  }
}

