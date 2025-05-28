"use server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function searchUsersAndPosts(query: string) {
  if (!query.trim()) {
    return { users: [], posts: [] };
  }

  // Xác định người dùng hiện tại (nếu có)
  const { userId: clerkId } = await auth();

  const currentUser = clerkId
    ? await prisma.user.findUnique({
        where: { clerkId },
      })
    : null;

  // Tìm người dùng
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { ten: { contains: query } },
        { username: { contains: query } },
      ],
    },
    select: {
      id: true,
      username: true,
      email: true,
      ten: true,
      ngaytao: true,
    },
  });

  // Tìm bài viết
  const baivietList = await prisma.baiviet.findMany({
    where: {
      noidung: {
        contains: query,
      },
      OR: [
        { congkhai: true },
        { AND: [{ congkhai: false }, { tacgiaID: currentUser?.id }] },
      ],
    },
    orderBy: {
      ngaytao: "desc",
    },
    take: 20,
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
      phuongtien: true,
      _count: {
        select: {
          yeuthich: true,
          binhluan: true,
        },
      },
    },
  });

  // Thêm trường `daThich`
  const posts = baivietList.map((bv) => ({
    ...bv,
    daThich: currentUser
      ? bv.yeuthich.some((yt) => yt.nguoidungID === currentUser.id)
      : false,
  }));

  return { users, posts };
}
