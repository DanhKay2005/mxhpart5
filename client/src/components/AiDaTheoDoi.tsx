"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  RandomNguoiDung,
  getFollowingIds,
  getCurrentUserId,
} from "@/actions/user.action";
import { Avatar, AvatarImage } from "./ui/avatar";
import NutTheoDoi from "./Nut/NutTheoDoi";

type User = {
  id: number;
  username: string;
  ten: string;
  hinhanh?: string | null;
  _count: { nguoitheodoi: number };
};

export default function AiDaTheoDoi() {
  const [nguoidung, setNguoiDung] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const userId = await getCurrentUserId();
      if (!userId) {
        setNguoiDung([]);
        setLoading(false);
        return;
      }

      const following = await getFollowingIds(userId);
      const randomUsers = await RandomNguoiDung();

      const filteredUsers = randomUsers
        .filter((user) => !following.includes(user.id))
        .map((user) => ({
          ...user,
          ten: user.ten ?? "Không tên",
        }));

      setNguoiDung(filteredUsers);
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading)
    return (
      <p className="text-sm text-muted-foreground dark:text-gray-400">Đang tải...</p>
    );

  return (
    <div className="bg-background dark:bg-zinc-900 rounded-xl p-4 space-y-4 shadow-sm transition-colors duration-300">
      <h2 className="text-base font-semibold text-foreground dark:text-white">
        Những người bạn có thể sẽ biết
      </h2>
      <div className="space-y-2">
        {nguoidung.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center dark:text-gray-400">
            Hết người đề xuất
          </p>
        ) : (
          nguoidung.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-muted dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Link href={`/hoso/${user.username}`}>
                  <Avatar className="w-9 h-9 cursor-pointer ring-1 ring-primary/20">
                    <AvatarImage src={user.hinhanh ?? "/avatar.png"} />
                  </Avatar>
                </Link>
                <div className="text-sm space-y-0.5">
                  <Link
                    href={`/hoso/${user.username}`}
                    className="font-medium hover:underline text-foreground dark:text-white"
                  >
                    {user.ten}
                  </Link>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    @{user.username}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    {user._count.nguoitheodoi} người theo dõi
                  </p>
                </div>
              </div>
              <NutTheoDoi nguoidungId={user.id} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
