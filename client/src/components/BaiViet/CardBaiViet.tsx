"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageCircle, Send, MoreHorizontal, Globe, Lock } from "lucide-react";

import {
  getBaiViet,
  toggleLike,
  TaoBinhluan,
  XoaBaiviet,
  XoaBinhluan,
  CapNhatTrangThaiCongKhai,
} from "@/actions/Baiviet.action";

import { DeleteAlertDialog } from "../Xoa/DeleteArlertDialog";
import { DeleteCommentDialog } from "../Xoa/DeleteCommentDialog";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import { NutThich } from "../Nut/NutThich";
import { DangHinhAnh } from "../Nut/DangHinhAnh";
import { NutBinhLuan } from "../Nut/NutBinhLuan";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { ButtonBaoCao } from "../Nut/NutBaocao";

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
    baiviet.yeuthich.some((yt) => yt.nguoidungID === DbNguoidungId)
  );
  const [soLike, setSoLike] = useState(baiviet._count.yeuthich);
  const [DangThich, setDangThich] = useState(false);
  const [BinhluanMoi, setBinhluanMoi] = useState("");
  const [DangBinhluan, setDangBinhluan] = useState(false);
  const [DangXoa, setDangXoa] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsLimit, setCommentsLimit] = useState(3);
  const [binhluanXoaId, setBinhluanXoaId] = useState<number | null>(null);
  const [DangXoaBinhLuan, setDangXoaBinhLuan] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBaocaoDialog, setShowBaocaoDialog] = useState(false);

  const binhluanHienThi = baiviet.binhluan.slice(0, commentsLimit);

  const handleYeuThich = async () => {
    if (DangThich) return;
    setDangThich(true);
    const prevLiked = DaThich;
    const prevCount = soLike;

    try {
      setDaThich(!prevLiked);
      setSoLike(prevCount + (prevLiked ? -1 : 1));
      await toggleLike(baiviet.id);
    } catch {
      setDaThich(prevLiked);
      setSoLike(prevCount);
      toast.error("Không thể cập nhật lượt thích");
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
      setShowDeleteDialog(false);
    }
  };

  const confirmXoaBinhLuan = async () => {
    if (binhluanXoaId === null) return;
    try {
      setDangXoaBinhLuan(true);
      const ketqua = await XoaBinhluan(binhluanXoaId);
      if (ketqua.success) {
        toast.success("Đã xoá bình luận");
        router.refresh();
        setBinhluanXoaId(null);
      } else {
        throw new Error(ketqua.message);
      }
    } catch {
      toast.error("Không thể xoá bình luận");
    } finally {
      setDangXoaBinhLuan(false);
    }
  };

  return (
    <Card className="mb-6 transition-colors duration-300">
      <CardContent className="p-5 sm:p-7 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm transition-colors duration-300">
        <div className="flex gap-4 items-start">
          <Link href={`/hoso/${baiviet.tacgia.username}`}>
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarImage src={baiviet.tacgia.hinhanh ?? "/avatar.png"} />
            </Avatar>
          </Link>

          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Link
                  href={`/hoso/${baiviet.tacgia.username}`}
                  className="font-semibold hover:text-primary whitespace-nowrap"
                >
                  {baiviet.tacgia.ten}
                  <span className="relative group ml-2 inline-flex items-center">
                    {DbNguoidungId === baiviet.tacgia.id ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                            {baiviet.congkhai ? (
                              <Globe className="w-4 h-4 text-green-500" />
                            ) : (
                              <Lock className="w-4 h-4 text-red-500" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={() =>
                              startTransition(async () => {
                                const res = await CapNhatTrangThaiCongKhai(baiviet.id, true);
                                if (res.success) {
                                  toast.success("Đã chuyển sang công khai");
                                  router.refresh();
                                } else {
                                  toast.error(res.message || "Lỗi khi cập nhật");
                                }
                              })
                            }
                          >
                            <Globe className="w-4 h-4 mr-2 text-green-500" />
                            Công khai
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              startTransition(async () => {
                                const res = await CapNhatTrangThaiCongKhai(baiviet.id, false);
                                if (res.success) {
                                  toast.success("Đã chuyển sang riêng tư");
                                  router.refresh();
                                } else {
                                  toast.error(res.message || "Lỗi khi cập nhật");
                                }
                              })
                            }
                          >
                            <Lock className="w-4 h-4 mr-2 text-red-500" />
                            Riêng tư
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : baiviet.congkhai ? (
                      <Globe className="w-4 h-4 text-green-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-red-500" />
                    )}
                    <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 rounded bg-gray-800 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none select-none whitespace-nowrap z-10">
                      {baiviet.congkhai ? "Đã chia sẻ công khai" : "Đã chia sẻ riêng tư"}
                    </span>
                  </span>
                </Link>

                <span className="text-sm text-muted-foreground dark:text-gray-400 whitespace-nowrap">
                  {formatDistanceToNow(new Date(baiviet.ngaytao), { locale: vi })} trước
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {DbNguoidungId === baiviet.tacgia.id && (
                    <DropdownMenuItem className="text-red-600" onClick={() => setShowDeleteDialog(true)}>
                      Xoá bài viết
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setShowBaocaoDialog(true)}>Báo cáo</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DeleteAlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                isDeleting={DangXoa}
                onDelete={handleXoaBaiviet}
                onCancel={() => setShowDeleteDialog(false)}
                title="Xác nhận xoá"
                content="Bạn có chắc muốn xoá bài viết này không?"
              />

              <ButtonBaoCao
                open={showBaocaoDialog}
                onOpenChange={setShowBaocaoDialog}
                baivietId={baiviet.id}
              />
            </div>

            <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">{baiviet.noidung}</p>

            {baiviet.hinhanh && <DangHinhAnh src={baiviet.hinhanh} />}

            <div className="flex items-center gap-4 mt-4">
              <NutThich liked={DaThich} count={soLike} onClick={handleYeuThich} disabled={DangThich} />

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1 transition-colors"
              >
                <MessageCircle
                  className={`h-5 w-5 transition-colors ${
                    showComments
                      ? "fill-blue-500 stroke-none"
                      : "text-muted-foreground dark:text-gray-400"
                  }`}
                />
                {baiviet._count.binhluan}
              </button>
            </div>

            {showComments && (
              <div className="mt-4 space-y-3">
                {binhluanHienThi.length === 0 && (
                  <p className="text-muted-foreground text-sm italic dark:text-gray-400">Chưa có bình luận nào</p>
                )}

                {binhluanHienThi.map((bl) => (
                  <NutBinhLuan
                    key={bl.id}
                    bl={bl}
                    currentUserId={DbNguoidungId}
                    onDelete={(id) => setBinhluanXoaId(id)}
                    isDeleting={DangXoaBinhLuan}
                  />
                ))}

                {baiviet._count.binhluan > commentsLimit && (
                  <Button
                    variant="link"
                    className="text-sm"
                    onClick={() => setCommentsLimit(commentsLimit + 5)}
                  >
                    Xem thêm bình luận
                  </Button>
                )}

                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Viết bình luận..."
                    value={BinhluanMoi}
                    onChange={(e) => setBinhluanMoi(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleThemBinhLuan();
                    }}
                  />
                  <Button onClick={handleThemBinhLuan} disabled={DangBinhluan || !BinhluanMoi.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <DeleteCommentDialog
              open={binhluanXoaId !== null}
              isDeleting={DangXoaBinhLuan}
              onCancel={() => setBinhluanXoaId(null)}
              onDelete={confirmXoaBinhLuan}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
