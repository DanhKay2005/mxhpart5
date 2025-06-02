import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { LayUserBoiClerkId } from "@/actions/user.action";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import Link from "next/link";

export default async function SidebarHoso() {
  const DangNhap = await currentUser();
  if (!DangNhap) return <DangNhapSidebar />;

  const user = await LayUserBoiClerkId(DangNhap.id);
  if (!user) return <DangNhapSidebar />;

  return (
    <aside className="sticky top-20">
      <div className="pt-6 text-center flex flex-col items-center gap-y-2">
        <Link href={`/hoso/${user.username}`} className="flex flex-col items-center gap-1">
          <Avatar className="w-20 h-20 border-2">
            <AvatarImage src={user.hinhanh || "/avatar.png"} />
          </Avatar>
          <h3 className="font-semibold text-foreground">{user.ten}</h3>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </Link>

        {user.tieusu && (
          <p className="text-sm text-muted-foreground text-center mt-2">{user.tieusu}</p>
        )}


        <div className="flex justify-between w-full text-center text-sm">
          <div className="flex-1">
            <p className="font-semibold text-foreground">{user._count.dangtheodoi}</p>
            <p className="text-muted-foreground">Đang theo dõi</p>
          </div>
          <Separator orientation="vertical" />
          <div className="flex-1">
            <p className="font-semibold text-foreground">{user._count.nguoitheodoi}</p>
            <p className="text-muted-foreground">Người theo dõi</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

const DangNhapSidebar = () => (
  <aside className="sticky top-20">
    <div className="space-y-3 text-center">
      <h2 className="text-lg font-semibold">Chào mừng trở lại!</h2>
      <p className="text-sm text-muted-foreground">
        Đăng nhập để kết nối với mọi người.
      </p>
      <SignInButton mode="modal">
        <Button className="w-full" variant="outline">
          Đăng nhập
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button className="w-full">Đăng ký</Button>
      </SignUpButton>
    </div>
  </aside>
);
