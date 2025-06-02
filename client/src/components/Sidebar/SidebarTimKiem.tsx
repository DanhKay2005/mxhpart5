"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

export default function SidebarTimKiem() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const links = [
    { label: "Tất cả", href: "/timkiem" },
    { label: "Người dùng", href: "/timkiem/Nguoidung" },
    { label: "Bài viết", href: "/timkiem/Baiviet" },
  ];

  const handleClick = (href: string) => {
    router.push(`${href}?query=${encodeURIComponent(query)}`);
  };

  return (
    <aside className="w-full sm:w-64 mb-6 sm:mb-0">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm p-5 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Kết quả tìm kiếm</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Lọc kết quả theo loại nội dung</p>
        </div>

        <ul className="space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <li key={link.href}>
                <button
                  onClick={() => handleClick(link.href)}
                  className={clsx(
                    "w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all duration-200",
                    isActive
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-200"
                  )}
                >
                  {link.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
