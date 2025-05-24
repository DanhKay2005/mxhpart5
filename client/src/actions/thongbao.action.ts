"use server";
import prisma from "@/lib/prisma";
import { LayUserBoiId } from "./user.action";

export default async function getthongbao() {
  try {
    const nguoidungID = await LayUserBoiId();

    if (!nguoidungID) return [];

    const thongbao = await prisma.thongbao.findMany({
  where: {
    nguoidungID,
  },
  include: {
    nguoitao: {
      select: {
        id: true,
        ten: true,
        username: true,
        hinhanh: true,
      },
    },
    binhluan: {
      select: {
        noidung: true,
      },
    },
    baiviet: {
      select: {
        noidung: true,
      },
    },
  },
  orderBy: {
    ngaytao: "desc",
  },
});

    return thongbao;
  } catch (error) {
    console.error("Lỗi không lấy được thông báo", error);
    throw new Error("lỗi khi lấy thông báo");
  }
}

export async function DanhdauThongbao(thongbaoId: number[]) {
  try {
    await prisma.thongbao.updateMany({
      where: {
        id: {
          in: thongbaoId, 
        },
      },
      data: {
        daXem: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.log("Lỗi trong việc đánh dấu thông báo", error);
    return { success: false };
  }
}
