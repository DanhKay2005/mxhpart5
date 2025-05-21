"use server";

import prisma from "@/lib/prisma";

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

export async function getBaiVietTheoChuDe(chudeID: number, nguoidungID: number) {
  try {
    const baivietList = await prisma.baiviet.findMany({
      where: { chudeID },
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

    // Đánh dấu bài viết đã được người dùng thích hay chưa
    const data = baivietList.map((bv) => ({
      ...bv,
      daThich: bv.yeuthich.some((yt) => yt.nguoidungID === nguoidungID),
    }));

    return data;
  } catch (error: any) {
    console.error("❌ Lỗi khi lấy bài viết theo chủ đề:", error.message);
    return [];
  }
}
