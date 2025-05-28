import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { LayUserBoiClerkId } from "@/actions/user.action";
import { LinkIcon, MapPinIcon } from "lucide-react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import Link from "next/link";

export default async function SidebarHoso() {
  const DangNhap = await currentUser();
  if (!DangNhap) return <DangNhapSidebar />;

  const user = await LayUserBoiClerkId(DangNhap.id);
  if (!user) return <DangNhapSidebar />;

  return (
    <div className="sticky top-20">
      <Card>
        <CardContent className="pt-6 text-center">
          <Link href={`/hoso/${user.username}`} className="inline-block">
            <Avatar className="w-20 h-20 border-2 mx-auto">
              <AvatarImage src={user.hinhanh || "/avatar.png"} />
            </Avatar>
            <h3 className="mt-4 font-semibold text-gray-900 dark:text-gray-100">{user.ten}</h3>
            <p className="text-sm text-muted-foreground">{user.username}</p>
          </Link>

          {user.tieusu && <p className="mt-3 text-sm text-muted-foreground">{user.tieusu}</p>}

          <Separator className="my-4" />

          <div className="flex justify-between text-center">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{user._count.dangtheodoi}</p>
              <p className="text-xs text-muted-foreground">Đang theo dõi</p>
            </div>
            <Separator orientation="vertical" />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{user._count.nguoitheodoi}</p>
              <p className="text-xs text-muted-foreground">Người theo dõi</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const DangNhapSidebar = () => (
  <div className="sticky top-20">
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">Chào mừng trở lại!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-4">Đăng nhập để kết nối với mọi người.</p>
        <SignInButton mode="modal">
          <Button className="w-full" variant="outline">Đăng nhập</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="w-full mt-2">Đăng ký</Button>
        </SignUpButton>
      </CardContent>
    </Card>
  </div>
);
