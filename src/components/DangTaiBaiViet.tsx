"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "./ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";
import { TaoBaiViet } from "@/actions/Baiviet.action";

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

type Props = {
  chudeList?: { id: number; ten: string }[];
  macDinhChuDeID?: number;
};

type PostResult = {
  success: boolean;
  message?: string;
};

export default function DangTaiBaiViet({ chudeList, macDinhChuDeID }: Props) {
  const { user } = useUser();
  const [hinhanh, setHinhanh] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [noidung, setNoidung] = useState<string>("");
  const [dangTai, setDangTai] = useState<boolean>(false);
  const [taiHinhAnh, setTaiHinhAnh] = useState<boolean>(false);
  const [selectedChudeID, setSelectedChudeID] = useState<number | null>(macDinhChuDeID ?? null);

  useEffect(() => {
    if (!hinhanh) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(hinhanh);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [hinhanh]);

  useEffect(() => {
    if (macDinhChuDeID) {
      setSelectedChudeID(macDinhChuDeID);
    }
  }, [macDinhChuDeID]);

  const NhanGui = async () => {
    if (!noidung.trim() && !hinhanh) return;
    if (!selectedChudeID) {
      toast.error("Vui lòng chọn chủ đề");
      return;
    }

    setDangTai(true);
    try {
      let imageUrl: string | null = null;

      if (hinhanh) {
        try {
          imageUrl = await convertFileToBase64(hinhanh);
        } catch {
          toast.error("Lỗi khi xử lý hình ảnh");
          setDangTai(false);
          return;
        }
      }

      const ketqua: PostResult = await TaoBaiViet(noidung, imageUrl, selectedChudeID);
      if (ketqua.success) {
        setNoidung("");
        setHinhanh(null);
        setTaiHinhAnh(false);
        if (!macDinhChuDeID) setSelectedChudeID(null);
        toast.success("Đã đăng bài viết thành công");
      } else {
        toast.error(ketqua.message || "Không thể đăng bài viết");
      }
    } catch (error) {
      console.error("Lỗi khi tạo bài viết:", error);
      toast.error("Lỗi khi tạo bài viết");
    } finally {
      setDangTai(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHinhanh(file);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex space-x-3 items-start">
            <Avatar className="w-10 h-10 rounded-full overflow-hidden">
              <img src={user?.imageUrl || ""} alt={user?.fullName || "Avatar"} />
            </Avatar>
            <Textarea
              placeholder="Hãy nêu cảm nghĩ của bạn"
              className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base w-full"
              value={noidung}
              onChange={(e) => setNoidung(e.target.value)}
              disabled={dangTai}
            />
          </div>

          {/* Dropdown chỉ hiển thị nếu không có chủ đề mặc định */}
          {!macDinhChuDeID && chudeList && (
            <div>
              <select
                value={selectedChudeID ?? ""}
                onChange={(e) => setSelectedChudeID(Number(e.target.value))}
                className="w-full border rounded px-3 py-2 text-sm"
                disabled={dangTai}
              >
                <option value="">-- Chọn chủ đề --</option>
                {chudeList.map((cd) => (
                  <option key={cd.id} value={cd.id}>
                    {cd.ten}
                  </option>
                ))}
              </select>
            </div>
          )}

          {taiHinhAnh && (
            <div className="flex flex-col space-y-2">
              <label htmlFor="image-upload" className="text-sm cursor-pointer">
                <span className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <ImageIcon className="size-4" />
                  Chọn hình ảnh
                </span>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={dangTai}
                className="hidden"
              />
              {hinhanh && previewUrl && (
                <div className="relative w-40 h-40">
                  <img
                    src={previewUrl}
                    alt="Xem trước hình ảnh"
                    className="rounded-md w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-white rounded-full p-1"
                    onClick={() => setHinhanh(null)}
                    disabled={dangTai}
                  >
                    <XIcon className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setTaiHinhAnh(!taiHinhAnh)}
                disabled={dangTai}
              >
                <ImageIcon className="size-4 mr-2" />
                Hình ảnh
              </Button>
            </div>

            <Button
              className="flex items-center"
              onClick={NhanGui}
              disabled={(!noidung.trim() && !hinhanh) || dangTai}
            >
              {dangTai ? (
                <>
                  <Loader2Icon className="size-4 animate-spin mr-2" />
                  Đang tải...
                </>
              ) : (
                <>
                  <SendIcon className="size-4 mr-2" />
                  Đăng bài
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
