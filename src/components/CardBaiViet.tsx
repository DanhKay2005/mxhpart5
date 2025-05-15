  "use client";

  import { useUser } from "@clerk/nextjs";
  import { useRouter } from "next/navigation";
  import { useState } from "react";
  import toast from "react-hot-toast";
  import Link from "next/link";
  import { formatDistanceToNow } from "date-fns";
  import { Heart, MessageCircle, Send } from "lucide-react";

  import { getBaiViet, toggleLike, TaoBinhluan, XoaBaiviet } from "@/actions/Baiviet.action";
  import { DeleteAlertDialog } from "./DeleteArlertDialog";
  import { Card, CardContent } from "./ui/card";
  import { Avatar, AvatarImage } from "./ui/avatar";
  import { Button } from "./ui/button";
  import { Input } from "./ui/input";

  type BaiViet = Awaited<ReturnType<typeof getBaiViet>>;
  type Baiviet = BaiViet[number];

  export default function CardBaiViet({
    baiviet,
    DbNguoidungId,
  }: {
    baiviet: Baiviet;
    DbNguoidungId: number;
  }) {
    const { user } = useUser();
    const router = useRouter();

    const [DaThich, setDaThich] = useState(
    baiviet.yeuthich.some((yt) => yt.nguoidungID  === DbNguoidungId)
  );
    const [soLike, setSoLike] = useState(baiviet._count.yeuthich);
    const [DangThich, setDangThich] = useState(false);
    const [BinhluanMoi, setBinhluanMoi] = useState("");
    const [DangBinhluan, setDangBinhluan] = useState(false);
    const [DangXoa, setDangXoa] = useState(false);
    const [showComments, setShowComments] = useState(false); // ✅ thêm state

    const handleYeuThich = async () => {
      if (DangThich) return;
      try {
        setDangThich(true);
        setDaThich((prev) => !prev);
        setSoLike((prev) => prev + (DaThich ? -1 : 1));
        await toggleLike(baiviet.id);
      } catch (err) {
        setSoLike(baiviet._count.yeuthich);
        setDaThich(baiviet.yeuthich.some((yt) => yt.nguoidungID === DbNguoidungId));
      } finally {
        setDangThich(false);
      }
    };

    const handleThemBinhLuan = async () => {
      if (!BinhluanMoi.trim() || DangBinhluan) return;
      try {
        setDangBinhluan(true);
        const ketqua = await TaoBinhluan(baiviet.id, BinhluanMoi);
        if (ketqua?.success) {
          toast.success("Đã bình luận");
          setBinhluanMoi("");
          router.refresh();
        }
      } catch {
        toast.error("Không thể bình luận");
      } finally {
        setDangBinhluan(false);
      }
    };

    const handleXoaBaiviet = async () => {
      if (DangXoa) return;
      try {
        setDangXoa(true);
        const ketqua = await XoaBaiviet(baiviet.id);
        if (ketqua.success) {
          toast.success("Đã xoá bài viết");
          router.refresh();
        } else {
          throw new Error(ketqua.error);
        }
      } catch {
        toast.error("Không thể xoá bài viết");
      } finally {
        setDangXoa(false);
      }
    };

    return (
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-4 items-start">
            <Link href={`/hoso/${baiviet.tacgia.username}`}>
              <Avatar className="w-10 h-10">
                <AvatarImage src={baiviet.tacgia.hinhanh ?? "/avatar.png"} />
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <Link href={`/hoso/${baiviet.tacgia.username}`} className="font-semibold">
                    {baiviet.tacgia.ten}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    @{baiviet.tacgia.username} ·{" "}
                    {formatDistanceToNow(new Date(baiviet.ngaytao))} trước
                  </p>
                  {baiviet.chude?.ten && (
                    <p className="text-sm text-primary font-medium mt-1">
                      #{baiviet.chude.ten}
                    </p>
                  )}
                </div>
                {DbNguoidungId === baiviet.tacgiaID && (
                  <DeleteAlertDialog isDeleting={DangXoa} onDelete={handleXoaBaiviet} />
                )}
              </div>

              <p className="mt-3 break-words">{baiviet.noidung}</p>

              {baiviet.hinhanh && (
                <img
                  src={baiviet.hinhanh}
                  alt="Ảnh bài viết"
                  className="mt-3 rounded-lg w-full object-cover max-h-[400px]"
                />
              )}

              <div className="mt-4 flex gap-6 items-center text-sm text-muted-foreground">
                <button
                  onClick={handleYeuThich}
                  className="flex items-center gap-1 hover:text-red-500"
                >
                  <Heart
                    className={`h-5 w-5 ${DaThich ? "fill-red-500 text-red-500" : ""}`}
                  />
                  {soLike}
                </button>
                <button
                    onClick={() => setShowComments((prev) => !prev)}
                    className={`flex items-center gap-1 ${
                    showComments ? "text-blue-500" : "text-muted-foreground"
                      } hover:text-blue-500`}
                      >
                      <MessageCircle
                          className={`h-5 w-5 ${
                          showComments ? "text-blue-500 stroke-blue-500 fill-blue-500" : ""
                                    }`}
                      />
                        {baiviet._count.binhluan}
                    </button>
              </div>

              {/* Danh sách bình luận */}
              {showComments && (
                <>
                  {baiviet.binhluan.length > 0 && (
                    <div className="mt-4 space-y-3">
                      {baiviet.binhluan.map((bl) => (
                        <div key={bl.id} className="flex items-start gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={bl.tacgia.hinhanh ?? "/avatar.png"} />
                          </Avatar>
                          <div className="bg-muted px-3 py-2 rounded-xl max-w-lg">
                            <p className="font-medium text-sm">{bl.tacgia.ten}</p>
                            <p className="text-sm">{bl.noidung}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form bình luận */}
                  <div className="mt-4 flex gap-2 items-center">
                    <Input
                      value={BinhluanMoi}
                      onChange={(e) => setBinhluanMoi(e.target.value)}
                      placeholder="Viết bình luận..."
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleThemBinhLuan}
                      disabled={DangBinhluan || !BinhluanMoi.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }