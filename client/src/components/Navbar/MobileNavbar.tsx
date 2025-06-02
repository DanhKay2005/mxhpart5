"use client";

import {
  BellIcon,
  HomeIcon,
  UserIcon,
  MessageCircleIcon,
  MenuIcon,
  LogOutIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import {
  SignInButton,
  SignOutButton,
  useUser,
  UserButton,
} from "@clerk/nextjs";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function MobileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, isSignedIn } = useUser();
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  // Tạo đường dẫn hồ sơ user
  const userProfileUrl = user
    ? `/hoso/${
        user.username ?? user.emailAddresses[0].emailAddress.split("@")[0]
      }`
    : "/hoso";

  // Hàm xử lý submit tìm kiếm
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search.trim()) {
      startTransition(() => {
        // Dùng router để điều hướng (cần import useRouter nếu dùng)
        // hoặc window.location.href = `/timkiem?query=${encodeURIComponent(search.trim())}`
        window.location.href = `/timkiem?query=${encodeURIComponent(search.trim())}`;
      });
    }
  };

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

            {/* Thanh tìm kiếm */}
            <form onSubmit={handleSearch} className="mt-4 relative w-full">
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full text-sm w-full"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
                />
              </svg>
            </form>
          </SheetHeader>

          <nav className="flex flex-col space-y-4 mt-6">
            {/* Trang chủ */}
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

            {/* Bạn bè */}
            <Button
              variant="ghost"
              className="flex items-center gap-3 justify-start"
              asChild
            >
              <Link href="/banbe">
                <UserIcon className="w-4 h-4" />
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

                {/* User avatar + dropdown */}
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
