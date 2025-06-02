"use server";

import { searchUsersAndPosts } from "@/actions/timkiem.action";
import NutTheoDoi from "@/components/Nut/NutTheoDoi";
import SidebarTimKiem from "@/components/Sidebar/SidebarTimKiem";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

import Link from "next/link";

interface User {
  id: number;
  username: string;
  email: string | null;
  ten: string | null;
  ngaytao: string;
}

export default async function SearchUsersPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams.query || "";
  const { users } = await searchUsersAndPosts(query);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row gap-6">
         <SidebarTimKiem />

        <div className="flex-1">
          {users.length === 0 ? (
            <p className="text-gray-500 text-center mt-10 text-lg">Không tìm thấy người dùng nào.</p>
          ) : (
            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Người dùng</h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {users.map((user) => (
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
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
