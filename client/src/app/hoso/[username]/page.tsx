import {
  LayHoSoTuNguoiDung,
  LayBaivietTuNguoiDung,
  dangTheodoi,
} from "@/actions/Hoso.action";
import HosoNguoidung from "./HosoNguoidung";
import { notFound } from "next/navigation";
import { getAllChude } from "@/actions/Chude.action";
import Sidebarfull from "@/components/Sidebar/SidebarTrai";
import SidebarPhai from "@/components/Sidebar/SidebarPhai";
import Sidebar from "@/components/Sidebar/Sidebar";

export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await LayHoSoTuNguoiDung(params.username);
  if (!user) {
    return {
      title: "Không tìm thấy người dùng",
      description: "Trang hồ sơ không tồn tại.",
    };
  }

  return {
    title: `${user.ten} (@${user.username})`,
    description: user.tieusu || `Xem hồ sơ của ${user.ten}`,
    openGraph: {
      title: `${user.ten} (@${user.username})`,
      description: user.tieusu || `Xem hồ sơ của ${user.ten}`,
      images: [user.hinhanh || "/default-avatar.png"],
    },
  };
}

export default async function Hosopage({ params }: { params: { username: string } }) {
  const user = await LayHoSoTuNguoiDung(params.username);
  const chudeList = await getAllChude();

  if (!user) {
    return notFound();
  }

  const [baiviet,  nguoiDungDangTheoDoi] = await Promise.all([
    LayBaivietTuNguoiDung(user.id),
    dangTheodoi(user.id),
  ]);

  return (<div className="min-h-screen grid grid-cols-1 lg:grid-cols-10 gap-6 px-4 sm:px-6 lg:px-8">
        {/* Sidebar trái */}
        <aside className="hidden lg:flex lg:flex-col lg:col-span-2 gap-6">
          <Sidebar />
        </aside>
  
        {/* Nội dung chính */}
        <main className="lg:col-span-5 space-y-6">
          <HosoNguoidung user={user} baiviet={baiviet} isOwner={nguoiDungDangTheoDoi} chudeList={chudeList} />
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