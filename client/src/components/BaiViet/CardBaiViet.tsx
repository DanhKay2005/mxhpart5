"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageCircle, MoreHorizontal, Globe, Lock } from "lucide-react";

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

import { NutThich } from "../Nut/NutThich";
import { DangHinhAnh } from "../Nut/DangHinhAnh";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { ButtonBaoCao } from "../Nut/NutBaocao";
import DialogBinhLuan from "../Dialog/DialogBinhLuan";

type BaiViet = Awaited<ReturnType<typeof getBaiViet>>;
type Baiviet = BaiViet[number];

function MediaItem({ src, type }: { src: string; type: string }) {
  if (type === "video") {
    return (
      <video
        src={src}
        controls
        className="rounded-lg max-h-56 w-full object-cover"
      />
    );
  }
  return (
    <DangHinhAnh src={src} className="rounded-lg max-h-56 w-full object-cover" />
  );
}

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
  const [showEmoji, setShowEmoji] = useState(false);
  const [BinhluanMoi, setBinhluanMoi] = useState("");
  const [DangBinhluan, setDangBinhluan] = useState(false);
  const [DangXoa, setDangXoa] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsLimit, setCommentsLimit] = useState(3);
  const [binhluanXoaId, setBinhluanXoaId] = useState<number | null>(null);
  const [DangXoaBinhLuan, setDangXoaBinhLuan] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBaocaoDialog, setShowBaocaoDialog] = useState(false);
  const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState(false);
   const [openDialogBinhLuan, setOpenDialogBinhLuan] = useState(false);

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

  const handleEmojiClick = (emojiData: { emoji: string; }) => {
  setBinhluanMoi((prev) => prev + emojiData.emoji);
};

  return (
  <Card className="mb-6 rounded-2xl shadow-sm bg-white dark:bg-zinc-900 transition-colors duration-300">
    <CardContent className="p-5 sm:p-7">
      {/* Header: Avatar + Tên + Thời gian + Menu */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <Link href={`/hoso/${baiviet.tacgia.username}`}>
            <Avatar className="w-10 h-10 ring-2 ring-primary/20 cursor-pointer">
              <AvatarImage src={baiviet.tacgia.hinhanh ?? "/avatar.png"} />
            </Avatar>
          </Link>
          <div>
            <Link
              href={`/hoso/${baiviet.tacgia.username}`}
              className="font-semibold hover:text-primary cursor-pointer"
            >
              {baiviet.tacgia.ten}
            </Link>
            <div className="flex items-center gap-1 text-xs text-muted-foreground dark:text-gray-400">
  <span>
    {formatDistanceToNow(new Date(baiviet.ngaytao), { locale: vi })} trước
  </span>
  
  {DbNguoidungId === baiviet.tacgia.id ? (
  <button
    onClick={async () => {
      try {
        await CapNhatTrangThaiCongKhai(baiviet.id, !baiviet.congkhai);
        toast.success(
          !baiviet.congkhai ? "Đã chuyển sang công khai" : "Đã chuyển sang chế độ riêng tư"
        );
        startTransition(() => router.refresh());
      } catch {
        toast.error("Không thể cập nhật trạng thái bài viết");
      }
    }}
    className="ml-1"
    title={
      baiviet.congkhai
        ? "Công khai (nhấn để chuyển riêng tư)"
        : "Riêng tư (nhấn để chuyển công khai)"
    }
  >
    {baiviet.congkhai ? (
      <Globe className="w-4 h-4 text-blue-500" />
    ) : (
      <Lock className="w-4 h-4 text-yellow-500" />
    )}
  </button>
) : (
  <span className="ml-1">
    {baiviet.congkhai ? (
      <span title="Công khai">
        <Globe className="w-4 h-4 text-blue-500" />
      </span>
    ) : (
      <span title="Riêng tư">
        <Lock className="w-4 h-4 text-yellow-500" />
      </span>
    )}
  </span>
)}
</div>
          </div>
        </div>

        {/* Dropdown menu */}
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
      </div>

      {/* Nội dung bài viết */}
        <p className="whitespace-pre-wrap text-base leading-relaxed">{baiviet.noidung}</p>

        {/* Ảnh */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {baiviet.phuongtien
            ?.filter((pt) => pt.loai === "image")
            .slice(0, 4)
            .map((pt, index, arr) => {
              const count = arr.length;
              let className = "rounded object-cover w-full h-full";

              if (count === 3) {
                if (index < 2) className += " aspect-square";
                else if (index === 2) className += " aspect-[3/1] col-span-2";
              } else {
                className += " aspect-square";
              }

              return (
                <Link
                  key={pt.id}
                  href={`/baiviet/${baiviet.id}/hinhanh/${pt.id}`}
                  className={index === 2 && count === 3 ? "relative col-span-2" : "relative"}
                >
                  <img src={pt.url} alt="Hình ảnh" className={className} />
                  {index === 3 && baiviet.phuongtien.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                      <span className="text-white text-xl font-semibold">
                        +{baiviet.phuongtien.length - 4}
                      </span>
                    </div>
                  )}
                </Link>
              );
            })}
        </div>

        {/* Video */}
        <div className="mt-3">
          {baiviet.phuongtien
            ?.filter((pt) => pt.loai === "video")
            .map((pt) => (
              <video
                key={pt.id}
                src={pt.url}
                controls
                className="w-full max-h-60 rounded object-cover"
              />
            ))}
        </div>
     

      {/* Tương tác: Like, Comment */}
      <div className="flex items-center justify-center space-x-10">
        <NutThich liked={DaThich} count={soLike} onClick={handleYeuThich} disabled={DangThich}  />
        <button
  onClick={() => setOpenDialogBinhLuan(true)}
  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors select-none"
>
  <MessageCircle
    className={`h-6 w-6 transition-colors ${
      showComments ? "fill-blue-500 stroke-none" : "stroke-gray-400 dark:stroke-gray-500"
    }`}
  />
  <span className="text-lg font-semibold select-text">
    {baiviet._count.binhluan} Bình luận
  </span>
</button>

        <ButtonBaoCao
          baivietId={baiviet.id}
          open={showBaocaoDialog}
          onOpenChange={setShowBaocaoDialog}
        />
      </div>

      {/* Bình luận */}
    <DialogBinhLuan
  open={openDialogBinhLuan}
  onOpenChange={setOpenDialogBinhLuan}
  baiviet={baiviet}
  binhluanHienThi={binhluanHienThi}
  currentUserId={DbNguoidungId}
  BinhluanMoi={BinhluanMoi}
  setBinhluanMoi={setBinhluanMoi}
  handleThemBinhLuan={handleThemBinhLuan}
  handleEmojiClick={handleEmojiClick}
  DangBinhluan={DangBinhluan}
  showEmoji={showEmoji}
  setShowEmoji={setShowEmoji}
  commentsLimit={commentsLimit}
  setCommentsLimit={setCommentsLimit}
  setBinhluanXoaId={setBinhluanXoaId}
  setShowDeleteCommentDialog={setShowDeleteCommentDialog}

  DaThich={DaThich}
  soLike={soLike}
  handleYeuThich={handleYeuThich}
  DangThich={DangThich}
  DbNguoidungId={DbNguoidungId}

  // Mới thêm: trạng thái và hàm cho dialog xóa
  binhluanXoaId={binhluanXoaId}
  DangXoaBinhLuan={DangXoaBinhLuan}
  confirmXoaBinhLuan={confirmXoaBinhLuan}
  showDeleteCommentDialog={showDeleteCommentDialog}

  showDeleteDialog={showDeleteDialog}
  setShowDeleteDialog={setShowDeleteDialog}
  DangXoa={DangXoa}
  handleXoaBaiviet={handleXoaBaiviet}
/>

      {/* Dialog xóa bình luận */}
      <DeleteCommentDialog
        open={binhluanXoaId !== null}
        isDeleting={DangXoaBinhLuan}
        onDelete={confirmXoaBinhLuan}
        onCancel={() => setBinhluanXoaId(null)}
        onOpenChange={() => {}}
        title=""
        content=""
      />

      {/* Dialog xóa bài viết */}
      <DeleteAlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        isDeleting={DangXoa}
        onDelete={handleXoaBaiviet}
        onCancel={() => setShowDeleteDialog(false)}
        title="Xác nhận xoá"
        content="Bạn có chắc muốn xoá bài viết này không?"
      />
    </CardContent>
  </Card>
);
}
