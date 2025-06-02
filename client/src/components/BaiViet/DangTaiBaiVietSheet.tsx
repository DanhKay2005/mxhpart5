"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import DangTaiBaiViet from "./DangTaiBaiViet";
import { Card, CardContent } from "../ui/card";

type Props = {
  chudeList?: { id: number; ten: string }[];
  macDinhChuDeID?: number;
};

export default function DangTaiBaiVietDialog({ chudeList, macDinhChuDeID }: Props) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="flex items-center gap-3 bg-muted/40 dark:bg-zinc-800 rounded-xl p-4 shadow-sm cursor-pointer transition hover:bg-muted">
          <Avatar className="w-10 h-10 ring-1 ring-primary/20 overflow-hidden">
            <AvatarImage src={user?.imageUrl ?? "/avatar.png"} />
          </Avatar>
          <CardContent className="border-slate-300">
          <p className="text-muted-foreground text-sm">Bạn đang nghĩ gì thế?</p>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="p-4 w-[500px] h-[500px] max-w-full max-h-full rounded-xl overflow-auto">
        <DangTaiBaiViet chudeList={chudeList} macDinhChuDeID={macDinhChuDeID} />
      </DialogContent>
    </Dialog>
  );
}
