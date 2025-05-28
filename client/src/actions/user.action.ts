"use server";

import { currentUser } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Đồng bộ người dùng từ Clerk vào cơ sở dữ liệu
export async function synUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    const displayName =
      user.fullName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.emailAddresses?.[0]?.emailAddress.split("@")[0] ||
      "Ẩn danh";

    const username =
      user.username || user.emailAddresses?.[0]?.emailAddress.split("@")[0];

    const email = user.emailAddresses?.[0]?.emailAddress || "";

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        ten: displayName,
        username,
        email,
        hinhanh: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.error("Error syncing user:", error);
  }
}

// Lấy user từ clerkId
export async function LayUserBoiClerkId(clerkId: string) {
  return await prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          nguoitheodoi: true,
          dangtheodoi: true,
          baiviet: true,
        },
      },
    },
  });
}

// Lấy ID user đang đăng nhập
export async function LayUserBoiId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null

  const user = await LayUserBoiClerkId(clerkId);
  if (!user) throw new Error("Không tìm thấy người dùng");

  return user.id;
}

export async function LayUserBoiUsername(username: string) {
  const dbUser = await prisma.user.findUnique({
    where: { username },
  });

  return dbUser;
}


// Lấy danh sách người dùng ngẫu nhiên chưa được theo dõi
export async function RandomNguoiDung() {
  try {
    const currentUserId = await LayUserBoiId();

    if(!currentUserId) return [];

    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          {
            NOT: {
              nguoitheodoi: {
                some: {
                  nguoitheodoiID: currentUserId,
                },
              },
            },
          },
          {
            id: {
              not: currentUserId,
            },
          },
        ],
      },
      select: {
        id: true,
        ten: true,
        hinhanh: true,
        username: true,
        _count: {
          select: {
            nguoitheodoi: true,
          },
        },
      },
      take: 10,
    });

    return randomUsers;
  } catch (error) {
    console.error("Không thể lấy người dùng ngẫu nhiên:", error);
    return [];
  }
}

// Theo dõi / Bỏ theo dõi người dùng
export async function toggleFollow(nguoidungflId: number) {
  try {
    const nguoidungId = await LayUserBoiId();

    if(!nguoidungId) return;

    if (nguoidungId === nguoidungflId) {
      throw new Error("Không thể theo dõi chính mình");
    }

    const existingFollow = await prisma.theodoi.findUnique({
      where: {
        nguoidangtheodoiID_nguoitheodoiID: {
          nguoidangtheodoiID: nguoidungId,
          nguoitheodoiID: nguoidungflId,
        },
      },
    });

    if (existingFollow) {
      //  Transaction: Xoá theo dõi + xoá thông báo
      await prisma.$transaction([
        prisma.theodoi.delete({
          where: {
            nguoidangtheodoiID_nguoitheodoiID: {
              nguoidangtheodoiID: nguoidungId,
              nguoitheodoiID: nguoidungflId,
            },
          },
        }),
        prisma.thongbao.deleteMany({
          where: {
            loai: "theodoi",
            nguoidungID: nguoidungflId,
            nguoitaoID: nguoidungId,
          },
        }),
      ]);
    } else {
      //  Transaction: Tạo theo dõi + tạo thông báo
      await prisma.$transaction([
        prisma.theodoi.create({
          data: {
            nguoidangtheodoiID: nguoidungId,
            nguoitheodoiID: nguoidungflId,
          },
        }),
        prisma.thongbao.create({
          data: {
            loai: "theodoi",
            nguoidungID: nguoidungflId,
            nguoitaoID: nguoidungId,
          },
        }),
      ]);
    }

    return { success: true };
  } catch (error) {
    console.error("Lỗi khi xử lý theo dõi:", error);
    return { success: false, error: "Lỗi khi xử lý theo dõi" };
  }
}

export async function KiemTraDaTheoDoi(nguoidungflId: number) {
  const nguoidungId = await LayUserBoiId();

  if(!nguoidungId) return;

  // Không cần kiểm tra nếu là chính mình
  if (nguoidungId === nguoidungflId) return false;

  const daTheoDoi = await prisma.theodoi.findUnique({
    where: {
        nguoidangtheodoiID_nguoitheodoiID: {
        nguoidangtheodoiID: nguoidungId,
        nguoitheodoiID: nguoidungflId,
      },
    },
    select: {
      id: true, // chỉ cần lấy ID là đủ để biết có tồn tại
    },
  });

  return !!daTheoDoi;
}


type UserInfo = {
  ten: string | null;
  hinhanh: string | null;
  username: string;
};

export async function LayTenNguoiDung(nguoidungClerkId: string): Promise<UserInfo | null> {
  try {
    const nguoiDung = await prisma.user.findUnique({
      where: {
        clerkId: nguoidungClerkId,
      },
      select: {
        ten: true,
        hinhanh: true,
        username: true,
      },
    });

    if (!nguoiDung) return null;
    return nguoiDung;
  } catch (error) {
    console.log("❌ Lỗi khi lấy tên người dùng:", error);
    throw new Error("Lỗi khi load tên người dùng");
  }
}

export async function getCurrentUserId(): Promise<number | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) return null;

  return user.id;
}

export async function getFollowingIds(userId: number): Promise<number[]> {
  const following = await prisma.theodoi.findMany({
    where: { nguoidangtheodoiID: userId },  // bạn là người đang follow
    select: { nguoitheodoiID: true },       // lấy người bạn đang follow
  });
  return following.map(f => f.nguoitheodoiID);
}