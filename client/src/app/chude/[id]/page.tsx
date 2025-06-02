import { getBaiVietTheoChuDe, getAllChude } from "@/actions/Chude.action";
import { currentUser } from "@clerk/nextjs/server";
import CardBaiViet from "@/components/BaiViet/CardBaiViet";
import { Separator } from "@/components/ui/separator";
import { LayUserBoiId } from "@/actions/user.action";
import SidebarChude from "@/components/Sidebar/SidebarChude";
import DangTaiBaiVietSheet from "@/components/BaiViet/DangTaiBaiVietSheet";

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
    getBaiVietTheoChuDe(chudeId),
    getAllChude(),
  ]);

  const chude = chudeList.find((cd) => cd.id === chudeId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 flex gap-8">
      {/* Sidebar chủ đề */}
      <aside className="sticky top-20 hidden md:block w-[250px] max-h-[calc(100vh-5rem)] overflow-auto">
        <SidebarChude />
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 space-y-6">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-primary">
          {chude ? ` ${chude.ten}` : "Chủ đề không tồn tại"}
        </h1>

        <section className="mb-8">
          <DangTaiBaiVietSheet macDinhChuDeID={chudeId} />
        </section>

        <Separator className="my-4" />

        <section>
          {baiviets.length === 0 ? (
            <p className="text-center text-muted-foreground text-lg">
              Chưa có bài viết nào trong chủ đề này.
            </p>
          ) : (
            <div className="space-y-8">
              {baiviets.map((bv) => (
                <CardBaiViet
                  key={bv.id}
                  baiviet={bv}
                  DbNguoidungId={DbNguoidungId}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
