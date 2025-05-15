import { getBaiVietTheoChuDe, getAllChude } from "@/actions/Chude.action";
import { currentUser } from "@clerk/nextjs/server";
import CardBaiViet from "@/components/CardBaiViet";
import DangTaiBaiVietWrapper from "@/components/DangTaiBaiVietWrapper";
import { Separator } from "@/components/ui/separator";
import { LayUserBoiId } from "@/actions/user.action";

export default async function TrangChuDe({ params }: { params: { id: number } }) {
  const user = await currentUser();

  // Kiểm tra đăng nhập
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center text-red-500 font-semibold">
        Bạn cần đăng nhập để xem và đăng bài trong chủ đề này.
      </div>
    );
  }

  // Lấy DbNguoidungId đúng chuẩn như trang home
  const DbNguoidungId = await LayUserBoiId();

  // Nếu không tìm thấy người dùng trong database
  if (!DbNguoidungId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center text-red-500 font-semibold">
        Không tìm thấy người dùng trong hệ thống.
      </div>
    );
  }

  const chudeId = Number(params.id);

  // Lấy bài viết theo chủ đề và danh sách chủ đề
  const [baiviets, chudeList] = await Promise.all([
    getBaiVietTheoChuDe(chudeId, DbNguoidungId),
    getAllChude(),
  ]);

  const chude = chudeList.find((cd) => cd.id === chudeId);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-6">
      {/* Tên chủ đề */}
      <h1 className="text-2xl font-bold mb-4 text-center text-primary">
        {chude ? `Chủ đề: ${chude.ten}` : "Chủ đề không tồn tại"}
      </h1>

      {/* Form đăng bài */}
      <div className="mb-6">
        <DangTaiBaiVietWrapper macDinhChuDeID={chudeId} />
      </div>

      {/* Separator */}
      <Separator className="my-4" />

      {/* Danh sách bài viết */}
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
    </div>
  );
}