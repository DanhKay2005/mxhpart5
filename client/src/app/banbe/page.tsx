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

type User = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
};

function UserListItem({
  user,
  children,
}: {
  user: User;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3">
      <Link
        href={`/hoso/${user.username}`}
        className="flex items-center gap-3 flex-1"
      >
        <img
          src={user.avatarUrl || "/default-avatar.png"}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <span>{user.name}</span>
      </Link>
      {children}
    </li>
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

      const mapUser = (u: any) => ({
        id: String(u.id),
        name: u.ten ?? "Không tên",
        username: u.username,
        avatarUrl: u.hinhanh ?? undefined,
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
              <ul className="space-y-2">
                {friends.map((friend) => (
                  <UserListItem key={friend.id} user={friend} />
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
              <ul className="space-y-2">
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
              <ul className="space-y-2">
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
