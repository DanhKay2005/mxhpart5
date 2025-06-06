"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import initializeSocket from "@/lib/socket";
import { CallStore } from "@/lib/useStore";
import { Phone } from "lucide-react";
import Image from "next/image";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  nguoiDungId: string;
  BanId?: string;
};

export default function CallDialog({ open, setOpen, nguoiDungId, BanId }: Props) {
  const socket = initializeSocket(nguoiDungId);
  const active = CallStore((state) => state.active);
  const setActive = CallStore((state) => state.setActive);
  const callData = CallStore((state) => state.callData);
  const setCallData = CallStore((state) => state.setCallData);

  const rejectCall = () => {
    setActive(false);
    setOpen(false);
    setCallData(undefined);
    socket.emit("rejectCall", { BanId });
  };

  const startCall = React.useCallback(
    (element: HTMLDivElement | null) => {
      if (!element || !active || !callData) return;

      const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || "");
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

      if (!appID || !serverSecret) {
        console.error("❌ Thiếu ZEGO App ID hoặc Server Secret trong biến môi trường.");
        return;
      }

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        callData.roomID,
        nguoiDungId,
        callData.from.name
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      const link =
        typeof window !== "undefined"
          ? `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${callData.roomID}`
          : "";

      zp.joinRoom({
        container: element,
        sharedLinks: [
          {
            name: "Personal link",
            url: link,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
      });

      return () => {
        zp.destroy();
      };
    },
    [active, callData, nguoiDungId]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {callData?.from.name}
          </DialogTitle>
          <div>
            {!active && (
              <div className="flex items-center justify-center my-2">
                <Image
                  src={callData?.from.HinhAnh ?? ""}
                  alt={callData?.from.name ?? " "}
                  width={200}
                  height={200}
                  className="rounded-full"
                />
              </div>
            )}
            <div className="myCallContainer" ref={startCall} />
            <div className="flex items-center justify-center mt-10">
              <div
                onClick={rejectCall}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center cursor-pointer"
              >
                <Phone strokeWidth={3} className="text-white" />
              </div>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
