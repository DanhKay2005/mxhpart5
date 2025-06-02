"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getAllChude() {
  const chude = await prisma.chude.findMany({
    select: {
      id: true,
      ten: true,
    },
    orderBy: {
      ten: "asc",
    },
  });
  return chude;
}

export async function getBaiVietTheoChuDe(chudeID: number) {
  try {
    const { userId: clerkId } = await auth();

    const currentUser = clerkId
      ? await prisma.user.findUnique({
          where: { clerkId },
        })
      : null;

    const baivietList = await prisma.baiviet.findMany({
      where: { 
         chudeID,
        
       },
      orderBy: {
        ngaytao: "desc",
      },
      include: {
        tacgia: {
          select: {
            id: true,
            ten: true,
            username: true,
            hinhanh: true,
            ngaytao: true, 
          },
        },
        chude: true,
        phuongtien: true, 
        binhluan: {
          select: {
            id: true,
            noidung: true,
            ngaytao: true,
            tacgia: {
              select: {
                id: true,
                ten: true,
                hinhanh: true,
                ngaytao: true, 
              },
            },
          },
        },
        yeuthich: {
          select: {
            id: true,
            nguoidungID: true,
          },
        },
        _count: {
          select: {
            yeuthich: true,
            binhluan: true,
          },
        },
      },
    });

    // Lọc bài viết: nếu không phải tác giả thì chỉ lấy bài công khai
    const filtered = baivietList.filter((bv) => {
      if (!currentUser) return bv.congkhai; // nếu chưa đăng nhập thì chỉ xem bài công khai
      if (bv.tacgia.id === currentUser.id) return true; // tác giả xem hết
      return bv.congkhai; // người khác chỉ xem bài công khai
    });

    // Đánh dấu bài viết đã được người dùng thích hay chưa
    const data = filtered.map((bv) => ({
      ...bv,
      daThich: bv.yeuthich.some((yt) => yt.nguoidungID === currentUser?.id),
    }));

    return data;
  } catch (error: any) {
    console.error("❌ Lỗi khi lấy bài viết theo chủ đề:", error.message);
    return [];
  }
}
