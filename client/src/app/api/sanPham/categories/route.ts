import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../../prisma/src/generated/prisma';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.loaiSanPham.findMany({
      orderBy: {
        ten: 'desc',
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
