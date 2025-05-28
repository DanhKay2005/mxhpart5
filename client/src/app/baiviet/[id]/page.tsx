import AiDaTheoDoi from '@/components/AiDaTheoDoi';
import Sidebar from "@/components/Sidebar/Sidebar";
import CardBaiViet from '@/components/BaiViet/CardBaiViet';
import { getBaivietById } from '@/actions/Baiviet.action';
import React from 'react'

export default async function page({ params }: { params: { id: string; phuongtienId?: string } }) {
  const parsedId = Number(params.id);
  if (isNaN(parsedId)) return null;

  const baiviet = await getBaivietById(parsedId);
  if (!baiviet) return null;

  const phuongtienId = params.phuongtienId ? Number(params.phuongtienId) : null;

  return (
    <>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-10 gap-6 px-4 sm:px-6 lg:px-8">
        <aside className="hidden lg:block lg:col-span-2">
          <Sidebar />
        </aside>

        <main className="lg:col-span-5 space-y-6">
          <CardBaiViet
            baiviet={{
              ...baiviet,
              binhluan: baiviet.binhluan.map((b: any) => ({
                yeuthichBinhluan: b.yeuthichBinhluan ?? [],
                _count: b._count ?? {},
                daThichBinhLuan: b.daThichBinhLuan ?? false,
                ...b,
              })),
            }}
            DbNguoidungId={baiviet.tacgia.id}
          />
        </main>

        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20">
            <AiDaTheoDoi />
          </div>
        </aside>
      </div>

    </>
  );
}