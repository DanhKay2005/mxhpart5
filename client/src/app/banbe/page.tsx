"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getFriends,
  getFriendRequests,
  getFriendSuggestions,
} from "@/actions/banbe.action";
import { getCurrentUserId } from "@/actions/user.action";
import NutTheoDoi from "@/components/Nut/NutTheoDoi";
import SidebarBanBe from "@/components/Sidebar/SidebarBanBe";

// Sheet UI
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

type User = {
  id: string;
  ten: string;
  username: string;
  hinhanh?: string;
};

function UserListItem({
  user,
  children,
}: {
  user: User;
  children?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-between p-4 rounded-xl shadow-md bg-white dark:bg-muted">
      <Link
        href={`/hoso/${user.username}`}
        className="flex flex-col items-center gap-2"
      >
        <Avatar className="w-20 h-20 ring-1 ring-primary/20">
          <AvatarImage src={user.hinhanh ?? "/avatar.png"} />
        </Avatar>
        <div className="text-center">
          <p className="text-base font-semibold text-foreground dark:text-white truncate max-w-[120px]">
            {user.ten}
          </p>
          <p className="text-xs text-muted-foreground dark:text-gray-400 truncate max-w-[120px]">
            @{user.username}
          </p>
        </div>
      </Link>
      <div className="mt-2">{children}</div>
    </Card>
  );
}

export default function BanBePage() {
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "bans";

  useEffect(() => {
    async function fetchData() {
      const userId = await getCurrentUserId();
      if (!userId) return;

      const mapUser = (user: any): User => ({
        id: user.id,
        ten: user.ten || "Không tên",
        username: user.username,
        hinhanh: user.hinhanh || "/avatar.png",
      });

      const [fs, rs, ss] = await Promise.all([
        getFriends(userId),
        getFriendRequests(userId),
        getFriendSuggestions(userId),
      ]);

      setFriends(fs.map(mapUser));
      setRequests(rs.map(mapUser));
      setSuggestions(ss.map(mapUser));
    }

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Sidebar trên desktop */}
      <aside className="hidden lg:block lg:col-span-2">
        <SidebarBanBe />
      </aside>

      {/* Nút mở sidebar trên mobile */}
      <div className="lg:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium shadow hover:bg-primary/90 transition">
              Mở menu bạn bè
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 sm:w-80">
            <SheetHeader>
              <SheetTitle className="text-lg">Menu bạn bè</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <SidebarBanBe />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Nội dung chính */}
      <main className="col-span-1 lg:col-span-8 space-y-8">
        {tab === "bans" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Bạn bè của bạn</h2>
            {friends.length === 0 ? (
              <p>Bạn chưa có bạn bè nào.</p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {friends.map((friend) => (
                  <UserListItem key={friend.id} user={friend}>
                    <NutTheoDoi nguoidungId={Number(friend.id)} />
                  </UserListItem>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === "requests" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Lời mời kết bạn</h2>
            {requests.length === 0 ? (
              <p>Không có lời mời kết bạn mới.</p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {requests.map((user) => (
                  <UserListItem key={user.id} user={user}>
                    <NutTheoDoi nguoidungId={Number(user.id)} />
                  </UserListItem>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === "suggestions" && (
          <section>
            <h2 className="text-xl font-bold mb-4">Gợi ý kết bạn</h2>
            {suggestions.length === 0 ? (
              <p>Không có gợi ý kết bạn.</p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {suggestions.map((user) => (
                  <UserListItem key={user.id} user={user}>
                    <NutTheoDoi nguoidungId={Number(user.id)} />
                  </UserListItem>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
