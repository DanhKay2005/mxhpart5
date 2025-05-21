"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "../ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";
import { TaoBaiViet } from "@/actions/Baiviet.action";

const convertFileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

type Props = {
  chudeList?: { id: number; ten: string }[];
  macDinhChuDeID?: number;
};

export default function DangTaiBaiViet({ chudeList, macDinhChuDeID }: Props) {
  const { user } = useUser();

  const [hinhanh, setHinhanh] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [noidung, setNoidung] = useState("");
  const [dangTai, setDangTai] = useState(false);
  const [taiHinhAnh, setTaiHinhAnh] = useState(false);
  const [selectedChudeID, setSelectedChudeID] = useState<number | null>(
    macDinhChuDeID ?? null
  );
  const [congkhai, setCongkhai] = useState(true);

  useEffect(() => {
    if (!hinhanh) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(hinhanh);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [hinhanh]);

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

      const ketqua = await TaoBaiViet(noidung, imageUrl, selectedChudeID, congkhai);

      if (ketqua.success) {
        setNoidung("");
        setHinhanh(null);
        setTaiHinhAnh(false);
        if (!macDinhChuDeID) setSelectedChudeID(null);
        setCongkhai(true);
        toast.success("Đã đăng bài viết thành công");
      } else {
        toast.error(ketqua.message || "Không thể đăng bài viết");
      }
    } catch {
      toast.error("Lỗi khi tạo bài viết");
    } finally {
      setDangTai(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setHinhanh(file);
  };

  return (
    <Card className="mb-6 shadow rounded-2xl border bg-white dark:bg-gray-900 dark:border-gray-700">
  <CardContent className="pt-6 space-y-5">
    <div className="flex items-start space-x-4">
      <Avatar className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-500 shrink-0">
        <img src={user?.imageUrl || ""} alt="avatar" />
      </Avatar>
      <Textarea
        placeholder="Bạn đang nghĩ gì thế?"
        className="min-h-[100px] resize-none border border-gray-300 dark:border-gray-600
                   focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl px-5 py-3
                   text-base bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
        value={noidung}
        onChange={(e) => setNoidung(e.target.value)}
        disabled={dangTai}
      />
    </div>

    {!macDinhChuDeID && chudeList && (
      <select
        value={selectedChudeID ?? ""}
        onChange={(e) => setSelectedChudeID(Number(e.target.value))}
        disabled={dangTai}
        className="max-w-sm w-full rounded-lg border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-gray-800 py-2 px-4 text-gray-700 dark:text-gray-200 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      >
        <option value="">-- Chọn chủ đề --</option>
        {chudeList.map((cd) => (
          <option key={cd.id} value={cd.id}>
            {cd.ten}
          </option>
        ))}
      </select>
    )}

    {/* Toggle công khai/riêng tư */}
    <div className="flex space-x-3">
      {["Công khai", "Riêng tư"].map((label, idx) => {
        const value = idx === 0;
        const active = congkhai === value;
        return (
          <button
            key={label}
            type="button"
            onClick={() => setCongkhai(value)}
            disabled={dangTai}
            className={`flex-1 py-2 rounded-lg text-center text-sm font-medium
              ${
                active
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }
              transition`}
          >
            {label}
          </button>
        );
      })}
    </div>

    {taiHinhAnh && (
      <div className="space-y-3">
        <label
          htmlFor="image-upload"
          className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 transition"
        >
          <ImageIcon className="w-5 h-5" />
          Chọn hình ảnh
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
          <div className="relative max-w-xs rounded-xl overflow-hidden shadow-lg border border-gray-300 dark:border-gray-600">
            <img
              src={previewUrl}
              alt="preview"
              className="w-full h-auto object-cover"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md hover:bg-red-100 dark:hover:bg-red-900 transition"
              onClick={() => setHinhanh(null)}
              disabled={dangTai}
              aria-label="Xóa ảnh"
            >
              <XIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        )}
      </div>
    )}

    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setTaiHinhAnh((v) => !v)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600"
        disabled={dangTai}
      >
        <ImageIcon className="w-5 h-5" />
        Ảnh
      </Button>

      <Button
        onClick={NhanGui}
        disabled={(!noidung.trim() && !hinhanh) || dangTai}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-2xl shadow-md"
      >
        {dangTai ? (
          <>
            <Loader2Icon className="w-5 h-5 animate-spin" />
            <span>Đang tải...</span>
          </>
        ) : (
          <>
            <SendIcon className="w-5 h-5" />
            <span>Đăng bài</span>
          </>
        )}
      </Button>
    </div>
  </CardContent>
</Card>

  );
}
  