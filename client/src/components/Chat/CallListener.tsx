"use client";

import { useEffect, useRef, useState } from "react";
import initializeSocket from "@/lib/socket";
import { CallStore } from "@/lib/useStore";
import { useUser } from "@clerk/nextjs";
import CallComponent from "./CallComponent";
import type { Socket } from "socket.io-client";

export default function CallListener() {
  const { user } = useUser();
  const socketRef = useRef<Socket | null>(null);
  const [open, setOpen] = useState(false);
  const setCallData = CallStore((state) => state.setCallData);
  const callData = CallStore((state) => state.callData);
  const setActive = CallStore((state) => state.setActive);

  useEffect(() => {
    if (!user) return;

    if (!socketRef.current) {
      const socket = initializeSocket(user.id);
      socketRef.current = socket;

      socket.on("Cuộc gọi tới", (data: { from: any; roomID: string }) => {
        setCallData({
          from: data.from,
          roomID: data.roomID,
        });
        setOpen(true);
        setActive(false); // Đảm bảo là chưa bắt đầu gọi
      });

      socket.on("rejectCall", () => {
        setOpen(false);
        setCallData(undefined);
        setActive(false);
      });
    }

    return () => {
      const socket = socketRef.current;
      if (socket) {
        socket.off("Cuộc gọi tới");
        socket.off("rejectCall");
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  if (!user || !callData) return null;

  return (
    <CallComponent
      open={open}
      setOpen={setOpen}
      nguoiDungId={user.id}
      BanId={callData?.from?.id}
    />
  );
}
