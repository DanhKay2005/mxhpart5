"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAllChude } from "@/actions/Chude.action";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Chude = {
  id: number;
  ten: string;
  icon?: string;
};

function getChudeIcon(name?: string) {
  if (!name) return <Icons.TagIcon className="w-5 h-5 text-muted-foreground" />;
  const IconComponent = ((Icons as unknown) as Record<string, LucideIcon>)[name];
  if (!IconComponent) return <Icons.TagIcon className="w-5 h-5 text-muted-foreground" />;
  return <IconComponent className="w-5 h-5 text-muted-foreground" />;
}

export default function SidebarChude() {
  const [chudeList, setChudeList] = useState<Chude[]>([]);

  useEffect(() => {
    async function fetchChude() {
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
    }

    fetchChude();
  }, []);

  return (
    <aside className="w-60 p-4  border-muted-foreground rounded-md shadow-sm ">
      <h2 className="text-xl font-semibold mb-4 text-muted-foreground">Chủ đề</h2>
      <nav className="flex flex-col gap-2">
        {chudeList.map((cd) => (    
          <Link
            key={cd.id}
            href={`/chude/${cd.id}`}
            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-primary/20 transition text-muted-foreground"
          >
            {getChudeIcon(cd.icon)}
            <span>{cd.ten}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
