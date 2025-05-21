"use server";

import { currentUser,auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export const getTinNhan = async (banId: string) => {
  const nguoidung = await currentUser();
  const nguoidunghientai = nguoidung?.id;

  if (!nguoidunghientai) {
    throw new Error("Người dùng hiện tại không xác định");
  }

  const nguoidung1 = await prisma.user.findUnique({
    where: { clerkId: banId },
  });

  const nguoidung2 = await prisma.user.findUnique({
    where: { clerkId: nguoidunghientai },
  });

  if (!nguoidung1 || !nguoidung2) {
    throw new Error("Lỗi khi load người dùng");
  }

  try {
    const tinnhan = await prisma.tinNhan.findMany({
      where: {
        OR: [
          { nguoiGuiId: banId, nguoiNhanId: nguoidunghientai },
          { nguoiGuiId: nguoidunghientai, nguoiNhanId: banId },
        ],
      },
      orderBy: { ngaytao: "asc" },
    });

    return { Response: tinnhan };
  } catch (error) {
    throw new Error("Không thể tìm thấy tin nhắn");
  }
};

export const AllUser = async () => {
  const user = await currentUser();
  if (!user) return [];

  // Lấy user hiện tại từ DB qua clerkId
  const currentDbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });
  if (!currentDbUser) return [];

  const currentUserId = currentDbUser.id;
  const currentClerkId = currentDbUser.clerkId;

  // 1. Lấy những người đang follow mình
  const followers = await prisma.theodoi.findMany({
    where: { nguoitheodoiID: currentUserId },
    select: { nguoidangtheodoiID: true },
  });

  // 2. Lấy những người mình đang follow
  const following = await prisma.theodoi.findMany({
    where: { nguoidangtheodoiID: currentUserId },
    select: { nguoitheodoiID: true },
  });

  const followerIds = new Set(followers.map((f) => f.nguoidangtheodoiID));
  const followingIds = new Set(following.map((f) => f.nguoitheodoiID));

  // 3. Tính danh sách người theo dõi lẫn nhau (mutual follow)
  const mutualFollowIds = Array.from(followerIds).filter((id) =>
    followingIds.has(id)
  );

  // 4. Lấy clerkId từ các tin nhắn đã gửi hoặc nhận
  const tinNhan = await prisma.tinNhan.findMany({
    where: {
      OR: [{ nguoiGuiId: currentClerkId }, { nguoiNhanId: currentClerkId }],
    },
    select: { nguoiGuiId: true, nguoiNhanId: true },
  });

  const messagedClerkIds = new Set<string>();
  tinNhan.forEach((msg) => {
    if (msg.nguoiGuiId !== currentClerkId) messagedClerkIds.add(msg.nguoiGuiId);
    if (msg.nguoiNhanId !== currentClerkId) messagedClerkIds.add(msg.nguoiNhanId);
  });

  // 5. Lấy thông tin người dùng dựa trên mutual follow hoặc từng nhắn tin
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { id: { in: mutualFollowIds } },
        { clerkId: { in: Array.from(messagedClerkIds) } },
      ],
      NOT: { clerkId: currentClerkId },
    },
    select: {
      id: true,
      ten: true,
      clerkId: true,
      hinhanh: true,
    },
  });

  return users;
};


export const getCurrentUserId = async () => {
  const { userId } = await auth();
  const user = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  }).then((res) => res.json());

  return {
    id: user.id,
    firstName: user.first_name,
    imageUrl: user.image_url,
  };
};

export const getUserId = async (userId:string) => {
  const user =  await prisma.user.findUnique({
    where:{
      clerkId:userId
    }
  })
  return JSON.parse(JSON.stringify(user))
};
