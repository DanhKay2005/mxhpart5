import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import DangTaiBaiVietWrapper from "@/components/DangTaiBaiVietWrapper";
import AiDaTheoDoi from "@/components/AiDaTheoDoi";
import CardBaiViet from "@/components/CardBaiViet";
import {getBaiViet} from "@/actions/Baiviet.action";
import { LayUserBoiId } from "@/actions/user.action";

export default async function Home() {
  const Nguoidung = await currentUser();
  const DbNguoidungId = await LayUserBoiId();

  if (!Nguoidung || DbNguoidungId === null) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Vui lòng đăng nhập để xem và đăng bài viết.
      </div>
    );
  }

  const BaiViets = await getBaiViet();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
           <DangTaiBaiVietWrapper />

        <div className="space-y-6">
          {BaiViets.map((BaiViet) => (
            <CardBaiViet
              key={BaiViet.id}
              baiviet={BaiViet}
              DbNguoidungId={DbNguoidungId}
            />
          ))}
        </div>
      </div>

      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        <AiDaTheoDoi />
      </div>
    </div>
  );
}
