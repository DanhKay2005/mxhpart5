"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

export function DeleteAlertDialog({
  isDeleting,
  onDelete,
}: {
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="text-red-600 hover:underline text-sm flex items-center gap-1"
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4" />
          Xoá
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <p>Bạn có chắc chắn muốn xoá bài viết này?</p>
        <div className="flex justify-end gap-2 mt-4">
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? "Đang xoá..." : "Xác nhận"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}