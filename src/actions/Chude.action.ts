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
          },
        },
        chude: true,
        binhluan: {
          select: {
            id: true,
            noidung: true,
            tacgia: {
              select: {
                ten: true,
                hinhanh: true,
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
