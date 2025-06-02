"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { getAllChude } from "@/actions/Chude.action";
import {
  LayoutGrid,
  Users,
  ShoppingCart,
  Settings,
  Video,
} from "lucide-react";

const links = [
  { href: "/chude", label: "Chủ đề", icon: LayoutGrid },
  { href: "/banbe", label: "Bạn bè", icon: Users },
  { href: "/buonban", label: "Buôn bán", icon: ShoppingCart },
  { href: "/cai-dat", label: "Cài đặt", icon: Settings },
  { href: "/video", label: "Video", icon: Video },
];

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
      <p className="text-center py-4 text-muted-foreground">Đang tải...</p>
    );

  if (!user)
    return (
      <p className="text-center py-4 text-destructive">Vui lòng đăng nhập để xem sidebar</p>
    );

  return (
    <aside className="sticky top-20 space-y-4">
      <div className="space-y-5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition"
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
