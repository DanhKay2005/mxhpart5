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

function getChudeIcon(name?: string, isActive?: boolean) {
  if (!name) return <Icons.TagIcon className="w-5 h-5 text-primary" />;
  const IconComponent = ((Icons as unknown) as Record<string, LucideIcon>)[name];
  if (!IconComponent) return <Icons.TagIcon className="w-5 h-5 text-primary" />;
  return <IconComponent className="w-5 h-5 text-primary" />;
}

export default function Page() {
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Tất cả chủ đề</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {chudeList.map((cd) => (
          <Link
            key={cd.id}
            href={`/chude/${cd.id}`}
            className="flex items-center gap-3 p-4 border rounded-lg hover:bg-primary/10 transition"
          >
            {getChudeIcon(cd.icon)}
            <span className="text-base font-medium">{cd.ten}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
