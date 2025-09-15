// File: app/api/units/route.js

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // ดึงข้อมูล units ทั้งหมดจากฐานข้อมูล
    const units = await prisma.units.findMany({
      orderBy: {
        unit_id: 'asc', // เรียงตาม ID
      },
    });

    // ส่งข้อมูลกลับไปเป็น JSON
    return NextResponse.json(units);

  } catch (error) {
    console.error("UNITS_FETCH_ERROR", error);
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลหน่วยนับได้' },
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

    const newUnit = await prisma.units.create({
      data: {
        unit_name: unit_name,
      },
    });

    return NextResponse.json(newUnit, { status: 201 });
  } catch (error) {
    console.error("UNITS_CREATE_ERROR", error);
    return NextResponse.json(
      { error: 'ไม่สามารถสร้างหน่วยนับได้' },
      { status: 500 }
    );
  }
}

