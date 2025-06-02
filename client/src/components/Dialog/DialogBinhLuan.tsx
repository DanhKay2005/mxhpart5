"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { FaRegSmile } from "react-icons/fa";
import { MessageCircle, MoreHorizontal } from "lucide-react";
import EmojiPicker from "emoji-picker-react";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import { NutBinhLuan } from "../Nut/NutBinhLuan";
import { NutThich } from "../Nut/NutThich";
import { ButtonBaoCao } from "../Nut/NutBaocao";

import { DeleteCommentDialog } from "../Xoa/DeleteCommentDialog";
import { DeleteAlertDialog } from "../Xoa/DeleteArlertDialog";

interface DialogBinhLuanProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baiviet: any;
  binhluanHienThi: any[];
  currentUserId: number;
  BinhluanMoi: string;
  setBinhluanMoi: (value: string) => void;
  handleThemBinhLuan: () => void;
  handleEmojiClick: (emojiObject: any) => void;
  DangBinhluan: boolean;
  showEmoji: boolean;
  setShowEmoji: (value: boolean) => void;
  commentsLimit: number;
  setCommentsLimit: React.Dispatch<React.SetStateAction<number>>;
  setBinhluanXoaId: (id: number | null) => void;
  binhluanXoaId: number | null;
  DangXoaBinhLuan: boolean;
  confirmXoaBinhLuan: () => void;
  showDeleteCommentDialog: boolean;
  setShowDeleteCommentDialog: (value: boolean) => void;
  DaThich: boolean;
  soLike: number;
  handleYeuThich: () => void;
  DangThich: boolean;
  DbNguoidungId: number;

  showDeleteDialog: boolean;
  setShowDeleteDialog: (value: boolean) => void;
  DangXoa: boolean;
  handleXoaBaiviet: () => void;
}

export default function DialogBinhLuan({
  open,
  onOpenChange,
  baiviet,
  binhluanHienThi,
  currentUserId,
  BinhluanMoi,
  setBinhluanMoi,
  handleThemBinhLuan,
  handleEmojiClick,
  DangBinhluan,
  showEmoji,
  setShowEmoji,
  commentsLimit,
  setCommentsLimit,
  setBinhluanXoaId,
  binhluanXoaId,
  DangXoaBinhLuan,
  confirmXoaBinhLuan,
  showDeleteCommentDialog,
  setShowDeleteCommentDialog,
  DaThich,
  soLike,
  handleYeuThich,
  DangThich,
  DbNguoidungId,
  showDeleteDialog,
  setShowDeleteDialog,
  DangXoa,
  handleXoaBaiviet,
}: DialogBinhLuanProps) {
  const [showBaocaoDialog, setShowBaocaoDialog] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader >
            <DialogTitle>Chi tiết bài viết</DialogTitle>
          </DialogHeader>

          <CardContent className="p-5 sm:p-7">
            {/* Header */}
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
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    {formatDistanceToNow(new Date(baiviet.ngaytao), { locale: vi })} trước
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {DbNguoidungId === baiviet.tacgia.id && (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Xoá bài viết
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setShowBaocaoDialog(true)}>Báo cáo</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Nội dung */}
            <Link href={`/baiviet/${baiviet.id}`} className="block cursor-pointer mb-4">
              <p className="whitespace-pre-wrap text-base leading-relaxed">{baiviet.noidung}</p>

              {/* Hình ảnh */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {baiviet.phuongtien
                  ?.filter((pt: any) => pt.loai === "image")
                  .slice(0, 4)
                  .map((pt: any, index: number, arr: any[]) => {
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
                  ?.filter((pt: any) => pt.loai === "video")
                  .map((pt: any) => (
                    <video
                      key={pt.id}
                      src={pt.url}
                      controls
                      className="w-full max-h-60 rounded object-cover"
                    />
                  ))}
              </div>
            </Link>

            {/* Tương tác */}
            <div className="flex items-center justify-center space-x-10">
              <NutThich liked={DaThich} count={soLike} onClick={handleYeuThich} disabled={DangThich} />
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MessageCircle className="h-6 w-6 stroke-gray-400 dark:stroke-gray-500" />
                <span className="text-lg font-semibold">{baiviet._count.binhluan} Bình luận</span>
              </div>
              <ButtonBaoCao baivietId={baiviet.id} open={showBaocaoDialog} onOpenChange={setShowBaocaoDialog} />
            </div>

            {/* Danh sách bình luận */}
            <div className="space-y-3 mt-5">
              {binhluanHienThi.map((bl) => (
                <NutBinhLuan
                  key={bl.id}
                  bl={bl}
                  currentUserId={currentUserId}
                  onDelete={(id) => {
                    setBinhluanXoaId(id);
                    setShowDeleteCommentDialog(true);
                  }}
                  isDeleting={false}
                />
              ))}
              {baiviet._count.binhluan > commentsLimit && (
                <button
                  className="text-primary text-sm mt-2"
                  onClick={() => setCommentsLimit((prev: number) => prev + 3)}
                >
                  Xem thêm bình luận
                </button>
              )}
            </div>

            {/* Nhập bình luận */}
            <div className="mt-4 flex items-center gap-2">
              <Input
                placeholder="Viết bình luận..."
                value={BinhluanMoi}
                onChange={(e) => setBinhluanMoi(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleThemBinhLuan();
                }}
                disabled={DangBinhluan}
                className="flex-1 pl-10"
              />
              <div className="text-gray-400 cursor-pointer" onClick={() => setShowEmoji(!showEmoji)}>
                <FaRegSmile size={20} />
              </div>
              <Button onClick={handleThemBinhLuan} disabled={DangBinhluan}>
                Gửi
              </Button>
            </div>
            {showEmoji && (
              <div className="mt-2">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </CardContent>
        </DialogContent>
      </Dialog>

      {/* Dialog xóa bình luận */}
      <DeleteCommentDialog
        open={binhluanXoaId !== null && showDeleteCommentDialog}
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
    </>
  );
}
