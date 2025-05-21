"use server";
import prisma from "@/lib/prisma";

export async function getFriends(userId: number) {
  // Người mình theo dõi
  const following = await prisma.theodoi.findMany({
    where: { nguoidangtheodoiID: userId },
    select: { nguoitheodoiID: true },
  });
  const followingIds = following.map(f => f.nguoitheodoiID);

  // Người theo dõi mình
  const followers = await prisma.theodoi.findMany({
    where: { nguoitheodoiID: userId },
    select: { nguoidangtheodoiID: true },
  });
  const followerIds = followers.map(f => f.nguoidangtheodoiID);

  // Bạn bè: cả 2 chiều đều theo dõi nhau
  const friendIds = followingIds.filter(id => followerIds.includes(id));

  const friends = await prisma.user.findMany({
    where: { id: { in: friendIds } },
    select: { id: true, ten: true, username: true, hinhanh: true },
  });

  return friends;
}


export async function getFriendRequests(userId: number) {
  // Những người theo dõi mình
  const incomingRequests = await prisma.theodoi.findMany({
    where: { nguoitheodoiID: userId },
    select: { nguoidangtheodoiID: true },
  });
  const requesterIds = incomingRequests.map(r => r.nguoidangtheodoiID);

  // Người mình theo dõi lại trong số đó
  const userFollowings = await prisma.theodoi.findMany({
    where: {
      nguoidangtheodoiID: userId,
      nguoitheodoiID: { in: requesterIds },
    },
    select: { nguoitheodoiID: true },
  });
  const followedBackIds = userFollowings.map(fb => fb.nguoitheodoiID);

  // Lọc ra những người chưa follow lại mình
  const pendingRequestIds = requesterIds.filter(id => !followedBackIds.includes(id));

  const requests = await prisma.user.findMany({
    where: { id: { in: pendingRequestIds } },
    select: { id: true, ten: true, username: true, hinhanh: true },
  });

  return requests;
}


export async function getFriendSuggestions(userId: number, limit = 10) {
  // Lấy tất cả các mối quan hệ có userId tham gia (theo dõi hoặc được theo dõi)
  const related = await prisma.theodoi.findMany({
    where: {
      OR: [
        { nguoidangtheodoiID: userId },
        { nguoitheodoiID: userId },
      ],
    },
    select: { nguoidangtheodoiID: true, nguoitheodoiID: true },
  });

  const excludedIds = new Set<number>();
  excludedIds.add(userId);
  related.forEach(r => {
    excludedIds.add(r.nguoidangtheodoiID);
    excludedIds.add(r.nguoitheodoiID);
  });

  const suggestions = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludedIds) },
    },
    take: limit,
    select: { id: true, ten: true, username: true, hinhanh: true },
  });

  return suggestions;
}