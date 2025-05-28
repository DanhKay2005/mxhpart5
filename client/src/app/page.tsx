import { currentUser } from "@clerk/nextjs/server";

import { LayUserBoiId } from "@/actions/user.action";
import { getBaiViet } from "@/actions/Baiviet.action";

import DangTaiBaiVietWrapper from "@/components/BaiViet/DangTaiBaiVietWrapper";
import CardBaiViet from "@/components/BaiViet/CardBaiViet";
import AiDaTheoDoi from "@/components/AiDaTheoDoi";
import Sidebar from "@/components/Sidebar/Sidebar";
import SidebarHoso from "@/components/Sidebar/SidebarHoso";

export default async function Home() {
  const nguoiDung = await currentUser();
  const dbNguoiDungId = await LayUserBoiId();

  // Nếu chưa đăng nhập hoặc không tìm thấy người dùng trong DB
  if (!nguoiDung || !dbNguoiDungId) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Vui lòng đăng nhập để xem và đăng bài viết.
      </div>
    );
  }

  const baiViets = await getBaiViet();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-10 gap-6 px-4 sm:px-6 lg:px-8">
      {/* Sidebar bên trái */}
     <aside className="lg:block lg:col-span-2 flex flex-col gap-6">
  <div className="sticky top-20 z-10">
    <SidebarHoso />
  </div>
  <div className="sticky top-[calc(20rem+1.5rem)] z-0">
    <Sidebar />
  </div>
</aside>

      {/* Nội dung chính */}
      <main className="lg:col-span-5 space-y-6">
        <DangTaiBaiVietWrapper />
        {baiViets.map((baiViet) => (
          <CardBaiViet
            key={baiViet.id}
            baiviet={baiViet}
            DbNguoidungId={dbNguoiDungId}
          />
        ))}
      </main>

      {/* Sidebar bên phải */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-20">
          <AiDaTheoDoi />
        </div>
      </aside>
    </div>
  );
}
