"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { AnhActionsClient } from "@/components/BaiViet/AnhBaiViet/AnhActionsClient";
import {
  getPhuongTienById,
  getBinhluanAnh,
  getYeuthichAnh,
  getPhuongTienByBaivietId,
} from "@/actions/Anh.action";
import PhuongTienViewer, { PhuongTien } from "@/components/BaiViet/AnhBaiViet/PhuongTienViewer";

export default function AnhDetailPage() {
  const params = useParams();
  const router = useRouter();
  const phuongtienId = Number(params?.phuongtienId);
  const baivietId = Number(params?.id);

  const [phuongTien, setPhuongTien] = useState<PhuongTien | null>(null);
  const [binhluan, setBinhluan] = useState<any[]>([]);
  const [yeuthich, setYeuthich] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dsPhuongTienBaiviet, setDsPhuongTienBaiviet] = useState<PhuongTien[]>([]);

  // Cập nhật danh sách yêu thích khi like/unlike
  async function handleYeuthichUpdated() {
    if (!phuongtienId) return;
    try {
      const updatedYeuthich = await getYeuthichAnh(phuongtienId);
      setYeuthich(updatedYeuthich);
    } catch (error) {
      console.error("Lỗi cập nhật like:", error);
    }
  }

  useEffect(() => {
    async function load() {
      if (!phuongtienId) return;

      setLoading(true);
      try {
        const ptData = await getPhuongTienById(phuongtienId);
        if (!ptData) {
          setPhuongTien(null);
          return;
        }

        const pt: PhuongTien = {
          id: ptData.id,
          url: ptData.url,
          noidung: ptData.noidung ?? "",
          tacgia: ptData.baiviet?.tacgia
            ? {
                id: ptData.baiviet.tacgia.id,
                ten: ptData.baiviet.tacgia.ten ?? "",
                username: ptData.baiviet.tacgia.username,
                hinhanh: ptData.baiviet.tacgia.hinhanh ?? "",
              }
            : null,
        };

        setPhuongTien(pt);

        const [binhluanData, yeuthichData] = await Promise.all([
          getBinhluanAnh(phuongtienId),
          getYeuthichAnh(phuongtienId),
        ]);
        setBinhluan(binhluanData);
        setYeuthich(yeuthichData);

        if (baivietId) {
          const dsPtRaw = await getPhuongTienByBaivietId(baivietId);
          const dsPt = dsPtRaw.map((pt: any) => ({
            id: pt.id,
            url: pt.url,
            noidung: pt.noidung ?? "",
            tacgia: pt.baiviet?.tacgia
              ? {
                  id: pt.baiviet.tacgia.id,
                  ten: pt.baiviet.tacgia.ten ?? "",
                  username: pt.baiviet.tacgia.username,
                  hinhanh: pt.baiviet.tacgia.hinhanh ?? "",
                }
              : null,
          }));

          setDsPhuongTienBaiviet(dsPt);
        }
      } catch (error) {
        console.error("Lỗi tải ảnh:", error);
        setPhuongTien(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [phuongtienId, baivietId]);

  if (!phuongTien) return;

  const handleBack = () => {
    const referrer = document.referrer;

    if (referrer && referrer.includes(window.location.origin)) {
      router.back();
    } else {
      router.push(`/`);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="fixed h-screen w-screen p-0 bg-black text-white overflow-hidden max-w-none rounded-none">
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 z-50 text-muted-foreground"
        >
          <X size={28} />
        </button>

        <div className="flex h-full">
          <PhuongTienViewer
            dsPhuongTienBaiviet={dsPhuongTienBaiviet}
            baivietId={baivietId}
          />

          <div className="w-[420px] max-w-full bg-white text-black p-4 overflow-auto">
            <AnhActionsClient
              phuongtienId={phuongTien.id}
              baivietId={baivietId}
              binhluanLienQuan={binhluan}
              yeuthichLienQuan={yeuthich}
              onYeuthichUpdated={handleYeuthichUpdated}
              onDeleted={() => router.back()}
              tacgia={
                phuongTien.tacgia ?? {
                  id: 0,
                  ten: "",
                  username: "",
                  hinhanh: "",
                }
              }
              noidung={phuongTien.noidung}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
