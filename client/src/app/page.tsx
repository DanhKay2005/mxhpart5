import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";

import DangTaiBaiVietWrapper from "@/components/BaiViet/DangTaiBaiVietWrapper";
import AiDaTheoDoi from "@/components/AiDaTheoDoi";
import CardBaiViet from "@/components/BaiViet/CardBaiViet";
import Sidebar from "@/components/Sidebar/Sidebar";
import Navbar from "@/components/Navbar/Navbar";

import { getBaiViet } from "@/actions/Baiviet.action";
import { LayUserBoiId } from "@/actions/user.action";

export default async function Home() {
  const nguoiDung = await currentUser();
  const dbNguoiDungId = await LayUserBoiId();

  if (!nguoiDung || dbNguoiDungId === null) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Vui lòng đăng nhập để xem và đăng bài viết.
      </div>
    );
  }

  const baiViets = await getBaiViet();

  return (
    <>

      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-10 gap-6 px-4 sm:px-6 lg:px-8">
        {/* Sidebar */}
        <aside className="hidden lg:block lg:col-span-2">
          <Sidebar />
        </aside>

        {/* Main content */}
        <main className="lg:col-span-5 space-y-6">
          <DangTaiBaiVietWrapper />
          {baiViets.map((baiViet) => (
            <CardBaiViet key={baiViet.id} baiviet={baiViet} DbNguoidungId={dbNguoiDungId} />
          ))}
        </main>

        {/* Right sidebar */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-20">
            <AiDaTheoDoi />
          </div>
        </aside>
      </div>
    </>
  );
}