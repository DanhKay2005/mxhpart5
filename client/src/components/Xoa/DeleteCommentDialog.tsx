"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

type DeleteCommentDialogProps = {
  isDeleting: boolean;
  onDelete: () => void;
  onCancel: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
};

export function DeleteCommentDialog({ isDeleting, onDelete, onCancel, open }: DeleteCommentDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <p>Bạn có chắc chắn muốn xoá bình luận này?</p>
        <div className="flex justify-end gap-2 mt-4">
          <AlertDialogCancel onClick={onCancel}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? "Đang xoá..." : "Xác nhận"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
