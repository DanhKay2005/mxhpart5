"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "../ui/card";
import { Avatar } from "@radix-ui/react-avatar";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import {
  ImageIcon,
  VideoIcon,
  Loader2Icon,
  SendIcon,
  XIcon,
} from "lucide-react";
import toast from "react-hot-toast";
// Giả sử bạn có action tạo bài viết, thay bằng code thực tế
import { TaoBaiViet } from "@/actions/Baiviet.action";

type Props = {
  chudeList?: { id: number; ten: string }[];
  macDinhChuDeID?: number;
};

export default function DangTaiBaiViet({
  chudeList,
  macDinhChuDeID,
}: Props) {
  const { user } = useUser();

  const [hinhanhList, setHinhanhList] = useState<File[]>([]);
  const [videoList, setVideoList] = useState<File[]>([]);
  const [noidung, setNoidung] = useState("");
  const [dangTai, setDangTai] = useState(false);
  const [taiHinhAnh, setTaiHinhAnh] = useState(false);
  const [taiVideo, setTaiVideo] = useState(false);
  const [selectedChudeID, setSelectedChudeID] = useState<number | null>(
    macDinhChuDeID ?? null
  );
  const [congkhai, setCongkhai] = useState(true);

  // Preview urls
  const [previewHinhAnhUrls, setPreviewHinhAnhUrls] = useState<string[]>([]);
  const [previewVideoUrls, setPreviewVideoUrls] = useState<string[]>([]);

  useEffect(() => {
    if (hinhanhList.length === 0) {
      setPreviewHinhAnhUrls([]);
      return;
    }
    const urls = hinhanhList.map((file) => URL.createObjectURL(file));
    setPreviewHinhAnhUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [hinhanhList]);

  useEffect(() => {
    if (videoList.length === 0) {
      setPreviewVideoUrls([]);
      return;
    }
    const urls = videoList.map((file) => URL.createObjectURL(file));
    setPreviewVideoUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [videoList]);

  const NhanGui = async () => {
    if (!noidung.trim() && hinhanhList.length === 0 && videoList.length === 0)
      return;

    if (!selectedChudeID) {
      toast.error("Vui lòng chọn chủ đề");
      return;
    }

    setDangTai(true);
    try {
      const media: { url: string; loai: "image" | "video" }[] = [];

      const uploadFile = async (file: File, loai: "image" | "video") => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });

        if (!res.ok) throw new Error(`Upload ${loai} thất bại`);

        const data = await res.json();
        if (data.url) {
          media.push({ url: data.url, loai });
        } else {
          throw new Error("Upload trả về không hợp lệ");
        }
      };

      // Upload song song cho nhanh hơn
      await Promise.all(hinhanhList.map((file) => uploadFile(file, "image")));
      await Promise.all(videoList.map((file) => uploadFile(file, "video")));

      // Gửi dữ liệu bài viết lên server (tùy bạn xử lý trong action)
      const ketqua = await TaoBaiViet(noidung, media, selectedChudeID, congkhai);

      if (ketqua.success) {
        setNoidung("");
        setHinhanhList([]);
        setVideoList([]);
        setTaiHinhAnh(false);
        setTaiVideo(false);
        if (!macDinhChuDeID) setSelectedChudeID(null);
        setCongkhai(true);
        toast.success("Đã đăng bài viết thành công");
      } else {
        toast.error(ketqua.message || "Không thể đăng bài viết");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tạo bài viết");
    } finally {
      setDangTai(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Lọc chỉ lấy ảnh
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      setHinhanhList((prev) => [...prev, ...imageFiles]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Lọc chỉ lấy video
      const videoFiles = Array.from(files).filter((f) =>
        f.type.startsWith("video/")
      );
      setVideoList((prev) => [...prev, ...videoFiles]);
    }
  };

  const removeImage = (index: number) => {
    setHinhanhList((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideoList((prev) => prev.filter((_, i) => i !== index));
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
            className="min-h-[100px] resize-none border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl px-5 py-3 text-base bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
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
            className="max-w-sm w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-4 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="">-- Chọn chủ đề --</option>
            {chudeList.map((cd) => (
              <option key={cd.id} value={cd.id}>
                {cd.ten}
              </option>
            ))}
          </select>
        )}

        <div className="flex space-x-4 items-center">
          <label
            htmlFor="upload-hinhanh"
            className="cursor-pointer flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <ImageIcon size={18} />
            Ảnh
          </label>
          <input
            id="upload-hinhanh"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={dangTai}
          />

          <label
            htmlFor="upload-video"
            className="cursor-pointer flex items-center gap-1 text-green-600 hover:text-green-800"
          >
            <VideoIcon size={18} />
            Video
          </label>
          <input
            id="upload-video"
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={handleVideoChange}
            disabled={dangTai}
          />

          <label className="inline-flex items-center cursor-pointer select-none ml-auto space-x-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={congkhai}
              onChange={() => setCongkhai((v) => !v)}
              disabled={dangTai}
              className="form-checkbox"
            />
            <span>Công khai</span>
          </label>
        </div>

        {(previewHinhAnhUrls.length > 0 || previewVideoUrls.length > 0) && (
          <div className="grid grid-cols-3 gap-3 mt-3">
            {previewHinhAnhUrls.map((url, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`Ảnh ${i + 1}`}
                  className="object-cover w-full h-32 rounded-lg"
                />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  aria-label="Xóa ảnh"
                  type="button"
                >
                  <XIcon size={16} className="text-white" />
                </button>
              </div>
            ))}
            {previewVideoUrls.map((url, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden">
                <video
                  src={url}
                  controls
                  className="object-cover w-full h-32 rounded-lg bg-black"
                />
                <button
                  onClick={() => removeVideo(i)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  aria-label="Xóa video"
                  type="button"
                >
                  <XIcon size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={NhanGui}
            disabled={dangTai}
            className="flex items-center gap-2"
          >
            {dangTai ? (
              <>
                <Loader2Icon className="animate-spin" size={18} />
                Đang đăng...
              </>
            ) : (
              <>
                <SendIcon size={18} />
                Đăng bài
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
