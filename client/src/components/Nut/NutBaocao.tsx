import { useState, useTransition, useEffect } from "react";
import toast from "react-hot-toast";
import { BaocaoBaiviet } from "@/actions/Baocao.action";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

type ButtonBaoCaoProps = {
  baivietId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ButtonBaoCao({ baivietId, open, onOpenChange }: ButtonBaoCaoProps) {
  const [lydo, setLydo] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      console.log("Dialog đóng, reset lydo");
      setLydo("");
    } else {
      console.log("Dialog mở");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!lydo.trim()) {
      toast.error("Vui lòng nhập lý do");
      return;
    }

    startTransition(async () => {
      console.log("Gửi báo cáo:", lydo);
      const res = await BaocaoBaiviet(baivietId, lydo);
      console.log("Kết quả báo cáo:", res);
      if (res.success) {
        toast.success("Báo cáo thành công");
        onOpenChange(false);
      } else {
        toast.error(res.message || "Không thể báo cáo");
      }
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(openState) => {
        console.log("AlertDialog onOpenChange:", openState);
        onOpenChange(openState);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Báo cáo bài viết</AlertDialogTitle>
        </AlertDialogHeader>

        <Textarea
          value={lydo}
          onChange={(e) => setLydo(e.target.value)}
          placeholder="Nhập lý do báo cáo..."
          // Thử tạm comment autoFocus để xem có ảnh hưởng không
          // autoFocus
        />

        <AlertDialogFooter>
          <AlertDialogCancel>Huỷ</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={isPending || !lydo.trim()}>
            {isPending ? "Đang gửi..." : "Gửi báo cáo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}