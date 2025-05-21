"use client";

import { useEffect, useRef, useState } from "react";
import { getTinNhan } from "@/actions/chat.actions";
import { Input } from "../ui/input";
import { SendHorizonal } from "lucide-react";
import { Button } from "../ui/button";
import initializeSocket from "@/lib/socket";
import { useTinnhanStore } from "@/lib/useStore";
import { LayTenNguoiDung } from "@/actions/user.action"; // Hàm lấy tên + avatar
import MoreMenu from "./MoreMenu";

interface NhanChat {
  id: number;
  nguoiGuiId: string;
  nguoiNhanId: string;
  noidung: string;
  ngaytao: Date;
}

type Props = {
  BanId?: string; // Người đang chat cùng
  nguoidungId: string; // Người dùng hiện tại
  uniqueKey: string;
};

export default function ChatComponents({ BanId, nguoidungId, uniqueKey }: Props) {
  const [nhap, setNhap] = useState<string>("");
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tinnhan = useTinnhanStore((state) => state.tinnhans);
  const setTinnhan = useTinnhanStore((state) => state.setTinnhan);
  const addTinnhan = useTinnhanStore((state) => state.addTinnhan);

  // State lưu thông tin bạn chat
  const [banInfo, setBanInfo] = useState<{ ten: string | null; hinhanh: string | null; username: string } | null>(null);

  useEffect(() => {
    if (!socketRef.current && nguoidungId) {
      socketRef.current = initializeSocket(nguoidungId);
    }
  }, [nguoidungId]);

  // Lấy thông tin bạn chat (tên, hình ảnh) khi BanId thay đổi
  useEffect(() => {
    if (!BanId) {
      setBanInfo(null);
      return;
    }
    const fetchBanInfo = async () => {
      try {
        const info = await LayTenNguoiDung(BanId);
        setBanInfo(info);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin bạn chat:", error);
      }
    };
    fetchBanInfo();
  }, [BanId]);

  // Lấy tin nhắn khi chọn bạn chat
  useEffect(() => {
    if (!BanId) return;
    const fetchTinNhan = async () => {
      const dbTinNhan = await getTinNhan(BanId);
      if (dbTinNhan.Response) {
        setTinnhan(dbTinNhan.Response);
      }
    };
    fetchTinNhan();
  }, [BanId, setTinnhan]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !uniqueKey) return;

    const handleTinNhanMoi = (tinnhanmoi: NhanChat) => {
      addTinnhan(tinnhanmoi);
    };

    socket.on(uniqueKey, handleTinNhanMoi);
    return () => {
      socket.off(uniqueKey, handleTinNhanMoi);
    };
  }, [uniqueKey, addTinnhan]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tinnhan]);

  const GuiTinNhan = async () => {
    if (nhap.trim() && BanId) {
      const tinnhanData = {
        nguoiGuiId: nguoidungId,
        nguoiNhanId: BanId,
        noidung: nhap,
        id: Date.now(),
        ngaytao: new Date(),
      };
      socketRef.current.emit("guiTinnhan", tinnhanData);
      setNhap("");
    }
  };

  const filteredTinnhan = tinnhan.filter(
    (tn) =>
      (tn.nguoiGuiId === nguoidungId && tn.nguoiNhanId === BanId) ||
      (tn.nguoiGuiId === BanId && tn.nguoiNhanId === nguoidungId)
  );

  return (
    <div className="flex flex-col justify-between h-full max-h-full">
      

      {/* Header hiện tên và avatar bạn chat */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 shadow-sm">
       <div className="flex items-center gap-3">
      {banInfo ? (
      <>
        <img
          src={banInfo.hinhanh || "/default-avatar.png"}
          alt={banInfo.ten || "Avatar"}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="font-semibold text-lg">{banInfo.ten || banInfo.username}</div>
         </>
        ) : (
       <div className="text-gray-500 italic">Chưa chọn cuộc trò chuyện</div>
       )}
      </div>

       {/* Icon gọi video nằm góc phải header */}
      <MoreMenu nguoiDungId={nguoidungId} BanId={BanId} />
     </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 pt-6 bg-white" style={{ scrollPaddingTop: 24 }}>
        {BanId ? (
          filteredTinnhan.length ? (
            filteredTinnhan.map((tn) => (
              <div
                key={tn.id}
                className={`p-3 rounded-2xl my-2 max-w-xs break-words ${
                  tn.nguoiGuiId === nguoidungId ? "ml-auto bg-blue-500 text-white" : "mr-auto bg-gray-200"
                }`}
              >
                {tn.noidung}
                <div className="text-[10px] text-gray-500 text-right mt-1">
                  {new Date(tn.ngaytao).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 mt-10">Chưa có tin nhắn nào</div>
          )
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Chọn một cuộc trò chuyện để bắt đầu</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-3 flex gap-3 bg-white">
        <Input
          disabled={!BanId}
          value={nhap}
          onChange={(e) => setNhap(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && GuiTinNhan()}
          placeholder="Gửi tin nhắn..."
          className="flex-1"
        />
        <Button disabled={!BanId} onClick={GuiTinNhan} size="icon" variant="ghost" className="bg-blue-500 text-white">
          <SendHorizonal size={18} />
        </Button>
      </div>
    </div>
  );
}
