"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { LayUserBoiClerkId } from "./user.action";

// ✅ Lấy hồ sơ theo username
export async function LayHoSoTuNguoiDung(username: string) {
  try {
    const nguoiDung = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        ten: true,
        username: true,
        email:true,
        tieusu: true,
        hinhanh: true,
        diachi: true,
        website: true,
        ngaytao: true,
        clerkId: true,
        _count: {
          select: {
            nguoitheodoi: true,
            dangtheodoi: true,
            baiviet: true,
          },
        },
      },
    });

    return nguoiDung;
  } catch (error) {
    console.log("❌ Lỗi khi lấy hồ sơ:", error);
    throw new Error("Lỗi khi load hồ sơ");
  }
}


// ✅ Lấy bài viết từ một người dùng
export async function LayBaivietTuNguoiDung(nguoidungID: number) {
  try {
    const baiviet = await prisma.baiviet.findMany({
      where: {
        tacgiaID: nguoidungID,
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
        binhluan: {
          include: {
            tacgia: {
              select: {
                id: true,
                ten: true,
                username: true,
                hinhanh: true,
              },
            },
          },
        },
        yeuthich: {
          select: {
            nguoidungID: true,
          },
        },
        phuongtien: {
        select: {
          id: true,
          url: true,
          loai: true,
          noidung: true,
        },
      },
        _count: {
          select: {
            yeuthich: true,
            binhluan: true,
          },
        },
      },
      orderBy: {
        ngaytao: "desc",
      },
    });

    return baiviet;
  } catch (error) {
    console.log("❌ Lỗi khi lấy bài viết:", error);
    throw new Error("Lỗi khi load bài viết người dùng");
  }
}

export async function LayluotthichTuNguoiDungBaiViet(userId: number) {
  try {
    const baiviet = await prisma.baiviet.findMany({
      where: {
        yeuthich: {
          some: {
            nguoidungID: userId, // ✅ Hoặc dùng nguoidung: { id: userId }
          },
        },
      },
      include: {
        tacgia: {
          select: {
            id: true,
            ten: true,
            hinhanh: true,
            username: true,
          },
        },
      },
      orderBy: {
        ngaytao: "desc",
      },
    });

    return baiviet;
  } catch (error) {
    console.log("❌ Lỗi khi lấy bài viết đã thích:", error);
    throw new Error("Lỗi khi load bài viết đã thích");
  }
}

// ✅ Cập nhật hồ sơ người dùng
export async function capnhatHoso(formData: FormData) {
  try {
    const { userId: clerkId } = await  auth();
    if (!clerkId) throw new Error("Chưa đăng nhập");

    const ten = formData.get("ten") as string;
    const tieusu = formData.get("tieusu") as string;
    const diachi = formData.get("diachi") as string;
    const website = formData.get("website") as string;

    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        ten,
        tieusu,
        diachi,
        website,
      },
    });

    revalidatePath("/hoso");

    return { success: true, user };
  } catch (error) {
    console.log("❌ Lỗi cập nhật hồ sơ:", error);
    return { success: false, error: "Lỗi khi cập nhật hồ sơ" };
  }
}

// ✅ Kiểm tra đã theo dõi chưa
export async function dangTheodoi(nguoidungId: number) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return false;

    const currentUser = await LayUserBoiClerkId(clerkId);
    if (!currentUser) return false;

    const theodoi = await prisma.theodoi.findUnique({
      where: {
        nguoidangtheodoiID_nguoitheodoiID: {
          nguoidangtheodoiID: currentUser.id,
          nguoitheodoiID: nguoidungId,
        },
      },
    });

    return !!theodoi;
  } catch (error) {
    console.log("❌ Lỗi khi kiểm tra theo dõi:", error);
    return false;
  }
}
export async function toggleFollow(nguoidungId: number) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Chưa đăng nhập");

    const currentUser = await LayUserBoiClerkId(clerkId);
    if (!currentUser) throw new Error("Không tìm thấy người dùng");

    const existing = await prisma.theodoi.findUnique({
      where: {
        nguoidangtheodoiID_nguoitheodoiID: {
          nguoidangtheodoiID: currentUser.id,
          nguoitheodoiID: nguoidungId,
        },
      },
    });

    if (existing) {
      // Bỏ theo dõi
      await prisma.theodoi.delete({
        where: {
          nguoidangtheodoiID_nguoitheodoiID: {
            nguoidangtheodoiID: currentUser.id,
            nguoitheodoiID: nguoidungId,
          },
        },
      });
    } else {
      // Thêm theo dõi
      await prisma.theodoi.create({
        data: {
          nguoidangtheodoiID: currentUser.id,
          nguoitheodoiID: nguoidungId,
        },
      });
    }

    revalidatePath("/hoso");

    return { success: true };
  } catch (error) {
    console.log("❌ Lỗi toggleFollow:", error);
    return { success: false, error: "Lỗi khi cập nhật trạng thái theo dõi" };
  }
}