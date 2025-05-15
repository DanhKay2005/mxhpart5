'use client';

import { BellIcon, HomeIcon, UserIcon, MessageCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { ModeToggle } from "@/components/ModeToggle";
import { useState } from "react";

function DesktopNavbar() {
  const { user } = useUser();
  const [showChat, setShowChat] = useState(false); // trạng thái bật/tắt tin nhắn

  return (
    <>
      <div className="hidden md:flex items-center space-x-4">
        <ModeToggle />

        <Button variant="ghost" className="flex items-center gap-2" asChild>
          <Link href="/">
            <HomeIcon className="w-4 h-4" />
            <span className="hidden lg:inline">Trang chủ</span>
          </Link>
        </Button>

        {user ? (
          <>
            <Button variant="ghost" className="flex items-center gap-2" asChild>
              <Link href="/thongbao">
                <BellIcon className="w-4 h-4" />
                <span className="hidden lg:inline">Thông báo</span>
              </Link>
            </Button>

            {/* Nút bật/tắt tin nhắn */}
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircleIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Tin nhắn</span>
            </Button>

            <Button variant="ghost" className="flex items-center gap-2" asChild>
              <Link
                href={`/hoso/${
                  user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span className="hidden lg:inline">Hồ sơ</span>
              </Link>
            </Button>

            <UserButton />
          </>
        ) : (
          <SignInButton mode="modal">
            <Button variant="default">Đăng ký</Button>
          </SignInButton>
        )}
      </div>

      
    </>
  );
}

export default DesktopNavbar;
