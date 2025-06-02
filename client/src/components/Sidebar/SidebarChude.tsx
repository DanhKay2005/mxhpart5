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
  if (!name) return <Icons.Tag className="w-5 h-5 text-gray-400" />;
  const IconComponent = ((Icons as unknown) as Record<string, LucideIcon>)[name];
  if (!IconComponent) return <Icons.Tag className="w-5 h-5 text-gray-400" />;
  return <IconComponent className="w-5 h-5 text-gray-400" />;
}

export default function SidebarChude() {
  const [chudeList, setChudeList] = useState<Chude[]>([]);

  useEffect(() => {
    async function fetchChude() {
      const data = await getAllChude();
      const dataWithIcon = data.map((cd) => {
        let icon = "Tag";
        if (cd.ten.includes("Học bổng")) icon = "Gift";
        else if (cd.ten.includes("Học")) icon = "BookOpen";
        else if (cd.ten.includes("Lịch")) icon = "Calendar";
        else if (cd.ten.includes("Việc")) icon = "Briefcase";
        else if (cd.ten.includes("Công nghệ")) icon = "Laptop";
        else if (cd.ten.includes("Giải trí")) icon = "Smile";
        else if (cd.ten.includes("Ngoại khóa")) icon = "Users";
        return { ...cd, icon };
      });
      setChudeList(dataWithIcon);
    }

    fetchChude();
  }, []);

  return (
    <aside className="w-60 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <nav className="flex flex-col space-y-1">
        {chudeList.map((cd) => (
          <Link
            key={cd.id}
            href={`/chude/${cd.id}`}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition duration-150"
          >
            {getChudeIcon(cd.icon)}
            <span className="text-2xl font-medium truncate">{cd.ten}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
