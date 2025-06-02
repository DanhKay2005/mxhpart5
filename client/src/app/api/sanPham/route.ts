import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../prisma/src/generated/prisma';
import Decimal from 'decimal.js';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

interface ProductBody {
  title: string;
  price: number;
  description?: string;
  imageUrl: string;
  loaiID: number;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const loaiIDParam = url.searchParams.get("loaiID");
    const whereClause = loaiIDParam ? { loaiID: parseInt(loaiIDParam, 10) } : {};

    const products = await prisma.sanPham.findMany({
      where: whereClause,
      include: {
        nguoiban: true,
      },
      orderBy: {
        ngaytao: 'desc',
      },
    });

    const mappedProducts = products.map((product: any) => ({
      id: product.id,
      title: product.ten,
      price: Number(product.gia),
      description: product.mota ?? '',
      location: '', // Khong co truong location trong model SanPham
      imageUrl: product.hinhanh ?? '',
      sellerId: product.nguoibanID,
      sellerName: product.nguoiban?.ten ?? '',
      sellerClerkId: product.nguoiban?.clerkId ?? '',
      loaiID: product.loaiID,
    }));

    return NextResponse.json(mappedProducts);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authData = await auth();
    const clerkUserId = authData.userId;
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find internal user ID by Clerk userId (clerkId)
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body: ProductBody = await request.json();
    const { title, price, description, imageUrl, loaiID } = body;

    if (!title || !price || !imageUrl || !loaiID) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const priceDecimal = new Decimal(price);

    const newProduct = await prisma.sanPham.create({
      data: {
        ten: title,
        gia: priceDecimal,
        mota: description,
        hinhanh: imageUrl,
        nguoibanID: user.id,
        loaiID: loaiID,
      },
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const authData = await auth();
    const clerkUserId = authData.userId;
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find internal user ID by Clerk userId (clerkId)
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    if (!idParam) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Check ownership
    const product = await prisma.sanPham.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.nguoibanID !== user.id) {
      return NextResponse.json({ error: "Forbidden: You are not the owner of this product" }, { status: 403 });
    }

    await prisma.sanPham.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authData = await auth();
    const clerkUserId = authData.userId;
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find internal user ID by Clerk userId (clerkId)
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    if (!idParam) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }
    const id = parseInt(idParam, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Check ownership
    const product = await prisma.sanPham.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.nguoibanID !== user.id) {
      return NextResponse.json({ error: "Forbidden: You are not the owner of this product" }, { status: 403 });
    }

    const body: ProductBody = await request.json();
    const { title, price, description, imageUrl, loaiID } = body;

    if (!title || !price || !imageUrl || !loaiID) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const priceDecimal = new Decimal(price);

    const updatedProduct = await prisma.sanPham.update({
      where: { id },
      data: {
        ten: title,
        gia: priceDecimal,
        mota: description,
        hinhanh: imageUrl,
        loaiID: loaiID,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
