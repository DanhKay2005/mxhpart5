import {
  LayHoSoTuNguoiDung,
  LayBaivietTuNguoiDung,
  dangTheodoi,
} from "@/actions/Hoso.action";
import HosoNguoidung from "./HosoNguoidung";
import { notFound } from "next/navigation";

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

  if (!user) {
    return notFound();
  }

  const [baiviet,  nguoiDungDangTheoDoi] = await Promise.all([
    LayBaivietTuNguoiDung(user.id),
    dangTheodoi(user.id),
  ]);

  return (
    <HosoNguoidung user={user} baiviet={baiviet} isOwner={nguoiDungDangTheoDoi} />
  );
}