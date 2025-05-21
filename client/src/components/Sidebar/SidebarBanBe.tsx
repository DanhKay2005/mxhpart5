"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Users, UserPlus, Lightbulb } from "lucide-react";

const tabs = [
  { label: "Bạn bè", icon: Users, key: "bans" },
  { label: "Lời mời", icon: UserPlus, key: "requests" },
  { label: "Gợi ý", icon: Lightbulb, key: "suggestions" },
];

export default function SidebarBanBe() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "bans";

  return (
    <nav className="space-y-2">
      {tabs.map(({ label, icon: Icon, key }) => {
        const isActive = tab === key;
        return (
          <Link
            key={key}
            href={`/banbe?tab=${key}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
              isActive
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
