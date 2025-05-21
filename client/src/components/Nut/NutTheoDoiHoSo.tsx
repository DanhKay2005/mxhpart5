"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow } from "@/actions/user.action";

export default function NutTheoDoi({
  daTheoDoi,
  nguoidungflId,
}: {
  daTheoDoi: boolean;
  nguoidungflId: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      await toggleFollow(nguoidungflId);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`px-4 py-2 text-white rounded ${
        daTheoDoi ? "bg-gray-500" : "bg-blue-500"
      }`}
    >
      {isPending ? "Đang xử lý..." : daTheoDoi ? "Bỏ theo dõi" : "Theo dõi"}
    </button>
  );
}