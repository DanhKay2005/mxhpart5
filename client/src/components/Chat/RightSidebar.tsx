"use client";

import { useEffect, useState } from "react";
import { getCurrentUserId } from "@/actions/chat.actions";
import ChatComponents from "./ChatComponents";
import crypto from "crypto";

interface NhanChat {
  id: number;
  nguoiGuiId: string;
  nguoiNhanId: string;
  noidung: string;
  ngaytao: Date;
}

type Props = {
  tinnhan?: NhanChat[];
  BanId?: string;
};

export default function RightSidebar({ BanId }: Props) {
  const [nguoidungId, setNguoidungId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrentUserId() {
      const id = await getCurrentUserId();
      setNguoidungId(id.id ?? null);
    }
    fetchCurrentUserId();
  }, []);

  if (!nguoidungId || !BanId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
        Chưa có người dùng hoặc bạn bè được chọn.
      </div>
    );
  }

  // Tạo key socket event hash dựa trên id 2 user, đảm bảo ổn định
  const combinedIds = [nguoidungId, BanId].sort().join("");
  const socketEventKey = `chat:${crypto
    .createHash("sha256")
    .update(combinedIds)
    .digest("hex")}:tinnhan:update`;

  return (
    <aside className="h-full flex flex-col border-l border-gray-200 bg-white shadow-sm rounded-r-xl">

      {/* Nội dung chat chính, flex-grow giúp chiếm không gian còn lại */}
      <main className="flex-1 min-h-0 relative">
        <ChatComponents
          BanId={BanId}
          nguoidungId={nguoidungId}
          uniqueKey={socketEventKey}
        />
      </main>
    </aside>
  );
}
