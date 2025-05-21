"use client";

import {
  BellIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  MessageCircleIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useTransition } from "react";
import {
  SignInButton,
  SignOutButton,
  useUser,
  UserButton,
} from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function MobileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, isSignedIn } = useUser();
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const userProfileUrl = user
    ? `/hoso/${
        user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]
      }`
    : "/hoso";

  return (
    <div className="flex md:hidden items-center space-x-2">
      {/* Toggle Theme */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="mr-2"
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* Hamburger Menu */}
      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col space-y-4 mt-6">
            {/* Home */}
            <Button
              variant="ghost"
              className="flex items-center gap-3 justify-start"
              asChild
            >
              <Link href="/">
                <HomeIcon className="w-4 h-4" />
                <span>Trang chủ</span>
              </Link>
            </Button>

            {/* Chủ đề */}
            <Button
              variant="ghost"
              className="flex items-center gap-3 justify-start"
              asChild
            >
              <Link href="/chude">
                <TagIcon className="w-4 h-4" />
                <span>Chủ đề</span>
              </Link>
            </Button>

            {/* Bạn bè */}
            <Button
              variant="ghost"
              className="flex items-center gap-3 justify-start"
              asChild
            >
              <Link href="/banbe">
                <UsersIcon className="w-4 h-4" />
                <span>Bạn bè</span>
              </Link>
            </Button>

            {isSignedIn && user ? (
              <>
                {/* Thông báo */}
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 justify-start"
                  asChild
                >
                  <Link href="/thongbao">
                    <BellIcon className="w-4 h-4" />
                    <span>Thông báo</span>
                  </Link>
                </Button>

                {/* Tin nhắn */}
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 justify-start"
                  asChild
                >
                  <Link href="/tinnhan">
                    <MessageCircleIcon className="w-4 h-4" />
                    <span>{isPending ? "Đang tải..." : "Tin nhắn"}</span>
                  </Link>
                </Button>

                {/* Hồ sơ */}
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 justify-start"
                  asChild
                >
                  <Link href={userProfileUrl}>
                    <UserIcon className="w-4 h-4" />
                    <span>Hồ sơ</span>
                  </Link>
                </Button>

                {/* User avatar + dropdown menu */}
                <UserButton />

                {/* Đăng xuất */}
                <SignOutButton>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 justify-start w-full"
                  >
                    <LogOutIcon className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <SignInButton mode="modal">
                <Button variant="default" className="w-full">
                  Đăng ký
                </Button>
              </SignInButton>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
