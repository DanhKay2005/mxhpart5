"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getAllChude } from "@/actions/Chude.action";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Chude = {
  id: number;
  ten: string;
  icon?: string;
};

function getChudeIcon(name?: string, isActive?: boolean) {
  if (!name)
    return (
      <Icons.TagIcon
        className={`w-4 h-4 ${
          isActive ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      />
    );
  const IconComponent = ((Icons as unknown) as Record<string, LucideIcon>)[name];
  if (!IconComponent)
    return (
      <Icons.TagIcon
        className={`w-4 h-4 ${
          isActive ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      />
    );
  return (
    <IconComponent
      className={`w-4 h-4 ${
        isActive ? "text-primary-foreground" : "text-muted-foreground"
      }`}
    />
  );
}

export default function ChudeNavbar() {
  const [chudeList, setChudeList] = useState<Chude[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchChude() {
      try {
        const data = await getAllChude();

        const dataWithIcon = data.map((cd) => {
          let icon = "TagIcon";
          if (cd.ten.includes("Học bổng")) icon = "GiftIcon";
          else if (cd.ten.includes("Học")) icon = "BookIcon";
          else if (cd.ten.includes("Lịch")) icon = "CalendarIcon";
          else if (cd.ten.includes("Việc")) icon = "BriefcaseIcon";
          else if (cd.ten.includes("Công nghệ")) icon = "LaptopIcon";
          else if (cd.ten.includes("Giải trí")) icon = "SmileIcon";
          else if (cd.ten.includes("Ngoại khóa")) icon = "UsersIcon";
          return { ...cd, icon };
        });

        setChudeList(dataWithIcon);
      } catch (error) {
        console.error("❌ Lỗi khi lấy chủ đề:", error);
      }
    }
    fetchChude();
  }, []);

  function getLinkClass(isActive: boolean, extraClasses = "") {
    return [
      "flex items-center gap-2 px-4 py-1 rounded-full text-sm font-medium transition-colors",
      isActive
        ? "bg-primary text-primary-foreground"
        : "bg-transparent text-muted-foreground hover:bg-primary/10 hover:text-primary-foreground",
      extraClasses,
    ].join(" ");
  }

  return (
    <div className="hidden md:block w-full border-b bg-background shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 py-2 whitespace-nowrap">
          <Link href="/" className={getLinkClass(pathname === "/")}>
            <Icons.HomeIcon
              className={`w-4 h-4 ${
                pathname === "/" ? "text-primary-foreground" : "text-muted-foreground"
              }`}
            />
            <span>Trang chủ</span>
          </Link>

          {chudeList.map((cd) => {
            const isActive = pathname === `/chude/${cd.id}`;
            return (
              <Link
                key={cd.id}
                href={`/chude/${cd.id}`}
                className={getLinkClass(isActive, "hidden lg:inline")}
              >
                {getChudeIcon(cd.icon, isActive)}
                {cd.ten}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
