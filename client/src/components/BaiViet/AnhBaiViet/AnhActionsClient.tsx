"use client";

import React, { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import {
  LuotThich,
  TaoBinhluan,
  XoaPhuongTien,
  XoaBinhluanAnh,
  getYeuthichAnh,
} from "@/actions/Anh.action";
import { LayUserBoiId } from "@/actions/user.action";
import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { NutThich } from "@/components/Nut/NutThich";

import EmojiPicker from "emoji-picker-react";
import { FaRegSmile } from "react-icons/fa";

interface AnhActionsClientProps {
  phuongtienId: number;
  baivietId: number;
  binhluanLienQuan: any[];
  yeuthichLienQuan: any[];
  onBinhluanUpdated?: () => void;
  onYeuthichUpdated?: () => void;
  onDeleted?: () => void;
  tacgia: {
    id: number;
    ten: string;
    username?: string;
    hinhanh?: string;
  };
  noidung: string;
  ngaytao?: string;
}

export function AnhActionsClient({
  phuongtienId,
  binhluanLienQuan,
  yeuthichLienQuan,
  onBinhluanUpdated,
  onYeuthichUpdated,
  onDeleted,
  tacgia,
  noidung,
  ngaytao,
}: AnhActionsClientProps) {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(yeuthichLienQuan.length);
  const [loading, setLoading] = useState({
    like: false,
    comment: false,
    deleteImage: false,
    deleteComment: false,
  });
  const [commentInput, setCommentInput] = useState("");
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [comments, setComments] = useState(binhluanLienQuan);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const id = await LayUserBoiId();
      setCurrentUserId(id);
      setLiked(yeuthichLienQuan.some((yt) => yt.nguoidungID === id));
      setLikesCount(yeuthichLienQuan.length);
    }
    fetchUser();
  }, [yeuthichLienQuan]);

  useEffect(() => {
    setComments(binhluanLienQuan);
  }, [binhluanLienQuan]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest(".comment-item")) {
        setSelectedCommentId(null);
      }
      if (!(e.target as HTMLElement).closest(".emoji-picker")) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLike = async () => {
    if (loading.like || currentUserId === null) return;
    setLoading((l) => ({ ...l, like: true }));
    try {
      await LuotThich(phuongtienId);
      const updatedLikes = await getYeuthichAnh(phuongtienId);
      setLikesCount(updatedLikes.length);
      setLiked(updatedLikes.some((yt) => yt.nguoidungID === currentUserId));
      onYeuthichUpdated?.();
      onBinhluanUpdated?.();
    } catch {
      toast.error("Không thể cập nhật lượt thích");
    } finally {
      setLoading((l) => ({ ...l, like: false }));
    }
  };

  const handleSubmitComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!commentInput.trim() || loading.comment) return;
    setLoading((l) => ({ ...l, comment: true }));
    try {
      const content = commentInput.trim();
      await TaoBinhluan(phuongtienId, content);
      toast.success("Đã bình luận");
      setCommentInput("");
      setComments((c) => [
        ...c,
        {
          id: Math.random(),
          noidung: content,
          tacgiaID: currentUserId,
          tacgia: { id: currentUserId, ten: tacgia.ten, username: tacgia.username },
          ngaytao: new Date().toISOString(),
        },
      ]);
      onBinhluanUpdated?.();
    } catch {
      toast.error("Không thể bình luận");
    } finally {
      setLoading((l) => ({ ...l, comment: false }));
    }
  };

  const handleDeleteImage = async () => {
    if (loading.deleteImage || currentUserId === null) return;
    if (!confirm("Bạn có chắc muốn xóa ảnh này?")) return;
    setLoading((l) => ({ ...l, deleteImage: true }));
    try {
      await XoaPhuongTien(phuongtienId);
      toast.success("Đã xóa ảnh");
      onDeleted?.();
    } catch {
      toast.error("Xóa ảnh thất bại");
    } finally {
      setLoading((l) => ({ ...l, deleteImage: false }));
    }
  };

  const handleDeleteComment = async (id: number) => {
    if (loading.deleteComment || currentUserId === null) return;
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    setLoading((l) => ({ ...l, deleteComment: true }));
    try {
      await XoaBinhluanAnh(id);
      toast.success("Đã xóa bình luận");
      setComments((c) => c.filter((x) => x.id !== id));
      onBinhluanUpdated?.();
      setSelectedCommentId(null);
    } catch {
      toast.error("Xóa bình luận thất bại");
    } finally {
      setLoading((l) => ({ ...l, deleteComment: false }));
    }
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setCommentInput((prev) => prev + emojiData.emoji);
  };

  if (currentUserId === null) return null;

  return (
    <div className="space-y-4">
      {/* Author */}
      <div className="flex gap-4 items-start">
        <Link href={`/hoso/${tacgia.username}`}>
          <Avatar className="w-10 h-10 ring-2 ring-primary/20">
            <AvatarImage src={tacgia.hinhanh ?? "/avatar.png"} />
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/hoso/${tacgia.username}`} className="font-semibold hover:text-primary">
                {tacgia.ten}
              </Link>
              {tacgia.username && <span className="text-sm text-muted-foreground">@{tacgia.username}</span>}
              {ngaytao && (
                <span className="text-sm text-gray-400">
                  {formatDistanceToNow(new Date(ngaytao), { locale: vi })} trước
                </span>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {tacgia.id === currentUserId && (
                  <DropdownMenuItem onClick={handleDeleteImage} className="text-red-600">
                    Xóa ảnh
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => toast("Báo cáo ảnh")}>Báo cáo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="mt-1 text-gray-800">{noidung}</p>
        </div>
      </div>

      {/* Like */}
      <div className="flex gap-4 items-center">
        <NutThich liked={liked} count={likesCount} onClick={handleLike} disabled={loading.like} />
      </div>

      {/* Comment Input */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Viết bình luận..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
              disabled={loading.comment}
              className="w-full rounded border px-9 py-1 focus:outline-none focus:ring focus:ring-primary"
            />
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={() => setShowEmoji((prev) => !prev)}
            >
              <FaRegSmile size={20} />
            </div>
          </div>
          <button
            onClick={handleSubmitComment}
            disabled={loading.comment || !commentInput.trim()}
            className="btn btn-primary px-4"
          >
            Gửi
          </button>
        </div>

        {showEmoji && (
          <div className="absolute z-50 top-12 left-0 emoji-picker">
            <EmojiPicker onEmojiClick={(emojiData) => handleEmojiClick(emojiData)} />
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-4 border-t pt-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center">Chưa có bình luận nào.</p>
        ) : (
          comments.map((bl) => {
            const isOwner = bl.tacgiaID === currentUserId;
            const isSelected = selectedCommentId === bl.id;
            return (
              <div
                key={bl.id}
                className="flex justify-between items-start border-b pb-2 comment-item cursor-pointer"
                onClick={() => setSelectedCommentId(bl.id)}
              >
                <div>
                  <p>
                    <Link href={`/hoso/${bl.tacgia?.username ?? ""}`} className="font-semibold hover:text-primary">
                      {bl.tacgia?.ten ?? "Người dùng"}
                    </Link>{" "}
                    <span className="text-gray-700">{bl.noidung}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(bl.ngaytao), { locale: vi })} trước
                  </p>
                </div>

                {isOwner && isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteComment(bl.id);
                    }}
                    disabled={loading.deleteComment}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Xóa
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
