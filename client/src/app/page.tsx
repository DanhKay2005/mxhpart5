import { currentUser } from "@clerk/nextjs/server";
import { LayUserBoiId } from "@/actions/user.action";
import { getBaiViet } from "@/actions/Baiviet.action";

import CardBaiViet from "@/components/BaiViet/CardBaiViet";
import Sidebarfull from "@/components/Sidebar/SidebarTrai";
import DangTaiBaiVietSheet from "@/components/BaiViet/DangTaiBaiVietSheet";
import { getAllChude } from "@/actions/Chude.action";
import SidebarPhai from "@/components/Sidebar/SidebarPhai";

export default async function Home() {
  const nguoiDung = await currentUser();
  if (!nguoiDung) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Vui lòng đăng nhập để xem và đăng bài viết.
      </div>
    );
  }

  const dbNguoiDungId = await LayUserBoiId();
  if (!dbNguoiDungId) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Không tìm thấy thông tin người dùng trong hệ thống.
      </div>
    );
  }

  const baiViets = await getBaiViet();
  const chudeList = await getAllChude();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-10 gap-6 px-4 sm:px-6 lg:px-8">
      {/* Sidebar trái */}
      <aside className="hidden lg:flex lg:flex-col lg:col-span-2 gap-6">
        <Sidebarfull />
      </aside>

      {/* Nội dung chính */}
      <main className="lg:col-span-5 space-y-6">
        <DangTaiBaiVietSheet chudeList={chudeList} />
        {baiViets.map((baiViet) => (
          <CardBaiViet
            key={baiViet.id}
            baiviet={baiViet}
            DbNguoidungId={dbNguoiDungId}
          />
        ))}
      </main>

      {/* Sidebar phải */}
      <aside className="hidden lg:block lg:col-span-3">
         <div className="sticky top-20">
        <SidebarPhai />
        </div>
      </aside>
    </div>
  );
}
