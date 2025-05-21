import { getBaiVietTheoChuDe, getAllChude } from "@/actions/Chude.action";
import { currentUser } from "@clerk/nextjs/server";
import CardBaiViet from "@/components/BaiViet/CardBaiViet";
import DangTaiBaiVietWrapper from "@/components/BaiViet/DangTaiBaiVietWrapper";
import { Separator } from "@/components/ui/separator";
import { LayUserBoiId } from "@/actions/user.action";
import SidebarChude from "@/components/Sidebar/SidebarChude";

export default async function TrangChuDe({ params }: { params: { id: number } }) {
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

  const chudeId = Number(params.id);

  const [baiviets, chudeList] = await Promise.all([
    getBaiVietTheoChuDe(chudeId, DbNguoidungId),
    getAllChude(),
  ]);

  const chude = chudeList.find((cd) => cd.id === chudeId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
      {/* Sidebar chủ đề */}
      <SidebarChude />

      {/* Nội dung chính */}
      <main>
        <h1 className="text-2xl font-bold mb-4 text-center text-primary">
          {chude ? `Chủ đề: ${chude.ten}` : "Chủ đề không tồn tại"}
        </h1>

        <div className="mb-6 ">
          <DangTaiBaiVietWrapper macDinhChuDeID={chudeId} />
        </div>

        <Separator className="my-4" />

        <div className="space-y-6">
          {baiviets.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Chưa có bài viết nào trong chủ đề này.
            </p>
          ) : (
            baiviets.map((bv) => (
              <CardBaiViet
                key={bv.id}
                baiviet={bv}
                DbNguoidungId={DbNguoidungId}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
