import { getPhuongTienVideo } from "@/actions/Baiviet.action"
import { LayUserBoiId } from "@/actions/user.action";
import AiDaTheoDoi from "@/components/AiDaTheoDoi";
import CardBaiViet from "@/components/BaiViet/CardBaiViet";

import Sidebar from "@/components/Sidebar/Sidebar";
import SidebarHoso from "@/components/Sidebar/SidebarHoso";
import { currentUser } from "@clerk/nextjs/server";
import DangTaiBaiVietSheet from "@/components/BaiViet/DangTaiBaiVietSheet";


export default async function page() {
    const user = await currentUser();
    
      if (!user) {
        return (
          <div className="max-w-2xl mx-auto px-4 py-10 text-center text-red-500 font-semibold">
            Bạn cần đăng nhập để xem và đăng bài trong chủ đề này.
          </div>
        );
      }
    
      const DbNguoidungId = await LayUserBoiId();
    
      if (!DbNguoidungId) {
        return (
          <div className="max-w-2xl mx-auto px-4 py-10 text-center text-red-500 font-semibold">
            Không tìm thấy người dùng trong hệ thống.
          </div>
        );
      }
    const video = await getPhuongTienVideo();
    const videoWithMedia = video.filter((bv) => bv.phuongtien.length > 0);
  return  (
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
          <DangTaiBaiVietSheet />
          {videoWithMedia.map((baiViet) => (
            <CardBaiViet
              key={baiViet.id}
              baiviet={baiViet}
              DbNguoidungId={DbNguoidungId}
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

