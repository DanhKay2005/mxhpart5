"use client";

import { AllUser } from "@/actions/chat.actions";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

type User = {
  id: number;
  ten: string | null;
  clerkId: string;
  hinhanh: string | null;
};

interface LeftSidebarProps {
  isCollapsed: boolean;
  BanId?: string;  // Nhận id user đang chọn
}

function LeftSidebar({ isCollapsed, BanId }: LeftSidebarProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUsers = await AllUser();
      console.log("Fetched users:", fetchedUsers);
      if (fetchedUsers.length > 0) setUsers(fetchedUsers);
    };
    fetchUser();
  }, []);

  // So sánh convert về string cho chắc chắn
  const selectedUser = users.find(
    (user) => String(user.clerkId) === String(BanId)
  );

  return (
    <div className={cn("p-3 h-full flex flex-col", isCollapsed && "p-2")}>
      
      {/* Hiển thị thông tin user được chọn nếu có */}
      {selectedUser && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="font-semibold text-blue-700">Đang trò chuyện với:</p>
          <div className="flex items-center space-x-3 mt-2">
            <Image
              src={selectedUser.hinhanh ?? "/default-avatar.png"}
              alt={selectedUser.ten ?? "Người dùng"}
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-blue-900 font-medium truncate">{selectedUser.ten}</span>
          </div>
        </div>
      )}

      <div
        className={cn(
          "mt-2 flex flex-col overflow-y-auto",
          isCollapsed ? "gap-3" : "space-y-2"
        )}
      >
        {users.map((user) => {
          const isActive = String(user.clerkId) === String(BanId);
          return (
            <Link href={`/tinnhan/t/${user.clerkId}`} key={user.id}>
              <Card
                className={cn(
                  "flex items-center cursor-pointer transition hover:bg-gray-100",
                  isCollapsed ? "justify-center p-2" : "space-x-3 p-4"
                )}
                style={isActive ? { backgroundColor: "lightblue" } : undefined}
              >
                <div
                  className={cn(
                    "relative rounded-full overflow-hidden",
                    isCollapsed ? "w-10 h-10" : "w-10 h-10"
                  )}
                >
                  <Image
                    src={user.hinhanh ?? "/default-avatar.png"}
                    alt={user.ten ?? "Người dùng"}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                {!isCollapsed && (
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-neutral-800 truncate">
                      {user.ten}
                    </span>
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default LeftSidebar;
