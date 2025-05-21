"use client";

import initializeSocket from "@/lib/socket";
import { CallStore } from "@/lib/useStore";
import { Video } from "lucide-react";
import CallComponent from "./CallComponent";
import { useEffect, useRef, useState } from "react";
import { getUserId } from "@/actions/chat.actions";
import { User as PrismaUser } from "../../../prisma/src/generated/prisma";
import { useUser } from "@clerk/nextjs";

type Props = {
  BanId?: string;
  nguoiDungId: string;
};

export default function MoreMenu({ BanId, nguoiDungId }: Props) {
  const socketRef = useRef<any>(null);
  const [user, setUser] = useState<PrismaUser>();
  const { user: clerkUser } = useUser();

  const active = CallStore((state) => state.active);
  const setActive = CallStore((state) => state.setActive);
  const callData = CallStore((state) => state.callData);
  const setCallData = CallStore((state) => state.setCallData);
  const [open, setOpen] = useState<boolean>(false);

  // Khởi tạo socket khi có nguoiDungId
  useEffect(() => {
    if (!socketRef.current && nguoiDungId) {
      socketRef.current = initializeSocket(nguoiDungId);
    }
  }, [nguoiDungId]);

  // Lấy thông tin người nhận cuộc gọi
  useEffect(() => {
    if (!BanId) return;
    const fetchBan = async () => {
      const currentUser = await getUserId(BanId);
      setUser(currentUser);
    };
    fetchBan();
  }, [BanId]);

  // Lắng nghe sự kiện cuộc gọi đến và từ chối
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleIncomingCall = (data: { from: any; roomID: string }) => {
      setCallData({
        from: data.from,
        roomID: data.roomID,
      });
      setOpen(true);
    };

    const handleCallRejected = () => {
      setCallData(undefined);
      setOpen(false);
      setActive(false);
    };

    socket.on("Cuộc gọi tới", handleIncomingCall);
    socket.on("CallRejected", handleCallRejected);

    return () => {
      socket.off("Cuộc gọi tới", handleIncomingCall);
      socket.off("CallRejected", handleCallRejected);
    };
  }, [setCallData, setOpen, setActive]);

  // Bắt đầu cuộc gọi
  const initializeCall = () => {
    if (!socketRef.current || !BanId || !clerkUser) return;

    const roomID = Date.now().toString();

    setOpen(true);
    setCallData({
      from: {
        id: BanId,
        name: user?.ten ?? "Không tên",
        HinhAnh: user?.hinhanh ?? "",
      },
      roomID,
    });

    socketRef.current.emit(
      "initialiseCall",
      {
        from: {
          id: nguoiDungId,
          name: clerkUser.firstName ?? "Không tên",
          HinhAnh: clerkUser.imageUrl ?? "",
        },
        roomID,
      },
      BanId
    );
  };

  return (
    <div className="flex items-center justify-end pr-10">
      <Video strokeWidth={2} onClick={initializeCall} className="cursor-pointer" />
      <CallComponent
        open={open}
        setOpen={setOpen}
        nguoiDungId={nguoiDungId}
        BanId={BanId}
      />
    </div>
  );
}
