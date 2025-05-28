"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { getAllChude } from "@/actions/Chude.action";
import {
  UserIcon,
  Users,
  LayoutGrid,
  ShoppingCart,
  Settings,
  Video,
  Newspaper,
} from "lucide-react";

export default function Sidebar() {
  const [chude, setChude] = useState<{ id: number; ten: string }[]>([]);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    async function fetchChude() {
      const data = await getAllChude();
      setChude(data);
    }

    fetchChude();
  }, [isLoaded]);

  if (!isLoaded)
    return (
      <p className="text-center py-4 text-gray-500 dark:text-gray-400">Đang tải...</p>
    );

  if (!user)
    return (
      <p className="text-center py-4 text-red-500 dark:text-red-400">
        Vui lòng đăng nhập để xem sidebar
      </p>
    );

  const username =
    user.username ?? user.emailAddresses[0]?.emailAddress.split("@")[0] ?? "user";

  return (
    <div className="sticky top-20 space-y-6">
      <div className="space-y-5 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm">
        <Link
          href="/chude"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <LayoutGrid className="w-5 h-5" />
          Chủ đề
        </Link>

        <Link
          href="/banbe"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <Users className="w-5 h-5" />
          Bạn bè
        </Link>

        {/* Các trang mới thêm */}
        <Link
          href="/buonban"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <ShoppingCart className="w-5 h-5" />
          Buôn bán
        </Link>

        <Link
          href="/cai-dat"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <Settings className="w-5 h-5" />
          Cài đặt
        </Link>

        <Link
          href="/video"
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <Video className="w-5 h-5" />
          Video
        </Link>
      </div>
    </div>
  );
}
