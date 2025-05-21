"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface DeleteAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDeleting: boolean;
  onDelete: () => void;
  onCancel?: () => void;
  title?: React.ReactNode;
  content?: React.ReactNode;
}

export function DeleteAlertDialog({
  open,
  onOpenChange,
  isDeleting,
  onDelete,
  onCancel,
  title = "Xác nhận xoá bài viết",
  content = "Bạn có chắc chắn muốn xoá bài viết này?",
}: DeleteAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <p>{content}</p>
        <div className="flex justify-end gap-2 mt-4">
          <AlertDialogCancel onClick={onCancel}>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? "Đang xoá..." : title}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
