"use client";

import { Avatar, AvatarImage } from "../ui/avatar";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

type Comment = {
  id: number;
  noidung: string;
  ngaytao: string | Date;
  tacgia: {
    id: number;
    ten: string | null;
    hinhanh: string | null;
  };
};

interface CommentItemProps {
  bl: Comment;
  currentUserId: number;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export function NutBinhLuan({ bl, currentUserId, onDelete, isDeleting }: CommentItemProps) {
  return (
    <div className="flex items-start gap-2 relative">
      <Avatar className="w-7 h-7 ring-1 ring-muted-foreground/10">
        <AvatarImage src={bl.tacgia.hinhanh ?? "/avatar.png"} />
      </Avatar>
      <div className="bg-muted px-3 py-2 rounded-2xl max-w-lg flex-1">
        <p className="font-medium text-sm">{bl.tacgia.ten}</p>
        <p className="text-sm break-words">{bl.noidung}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(bl.ngaytao), { locale: vi })} trước
        </p>
      </div>
      {currentUserId === bl.tacgia.id && (
        <button
          onClick={() => onDelete(bl.id)}
          disabled={isDeleting}
          className="absolute right-0 top-0 p-1 hover:text-red-500 transition-colors"
          title="Xoá bình luận"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
