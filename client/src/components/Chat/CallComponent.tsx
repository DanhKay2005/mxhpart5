"use client";

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
import React from "react";
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
    socket.emit("rejectCall", {}, BanId!);
  };

  const myMeeting = (element: HTMLDivElement | null) => {
    if (element && callData) {
      const appID = process.env.NEXT_PUBLIC_ZEGO_APP_ID;
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        parseInt(appID!),
        serverSecret!,
        callData?.roomID,
        nguoiDungId,
        callData?.from.name
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.joinRoom({
        container: element,
        sharedLinks: [
          {
            name: "Personal link",
            url:
              window.location.protocol +
              "//" +
              window.location.host +
              window.location.pathname +
              "?roomID=" +
              callData.roomID,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
      });
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-2xl p-6 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold text-gray-800">
            {callData?.from.name}
          </DialogTitle>
        </DialogHeader>

        {!active && (
          <div className="flex justify-center my-4">
            <Image
              src={callData?.from.HinhAnh ?? ""}
              alt={callData?.from.name ?? "Avatar"}
              width={180}
              height={180}
              className="rounded-full object-cover shadow-lg ring-2 ring-primary"
            />
          </div>
        )}

        <div
          className="myCallContainer"
          ref={myMeeting}
        ></div>

        <div className="flex justify-center mt-8">
          <button
            onClick={rejectCall}
            className="w-16 h-16 flex items-center justify-center bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-200"
          >
            <Phone strokeWidth={3} />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
