"use client";

import {
  BellIcon,
  HomeIcon,
  UserIcon,
  MessageCircleIcon,
  LayoutGrid,
  SearchIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { ModeToggle } from '@/components/Nut/ModeToggle';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Input } from '@/components/ui/input';
import { getAllChude } from '@/actions/Chude.action';
import * as Icons from 'lucide-react';

type Chude = {
  id: number;
  ten: string;
  icon?: string;
};

function getIcon(name?: string) {
  const Icon =
    ((Icons as unknown) as Record<string, any>)[name ?? 'TagIcon'] ?? Icons.TagIcon;
  return <Icon className="w-4 h-4 text-muted-foreground" />;
}

function DesktopNavbar() {
  const { user } = useUser();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [chudeList, setChudeList] = useState<Chude[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchChude() {
      const data = await getAllChude();
      const dataWithIcon = data.map((cd) => {
        let icon = 'TagIcon';
        if (cd.ten.includes('Học bổng')) icon = 'GiftIcon';
        else if (cd.ten.includes('Học')) icon = 'BookIcon';
        else if (cd.ten.includes('Lịch')) icon = 'CalendarIcon';
        else if (cd.ten.includes('Việc')) icon = 'BriefcaseIcon';
        else if (cd.ten.includes('Công nghệ')) icon = 'LaptopIcon';
        else if (cd.ten.includes('Giải trí')) icon = 'SmileIcon';
        else if (cd.ten.includes('Ngoại khóa')) icon = 'UsersIcon';
        return { ...cd, icon };
      });
      setChudeList(dataWithIcon);
    }
    fetchChude();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/timkiem?query=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
  <div className="hidden md:flex items-center justify-between w-full max-w-7xl mx-auto px-4 mt-2">
    {/* Left side: Navigation items */}
    <div className="flex items-center space-x-4">
      
      <form onSubmit={handleSearch} className="relative w-full max-w-sm mx-4">
      <Input
        type="text"
        placeholder="Tìm kiếm..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-10 pr-4 py-2"
      />
      <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
    </form>

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Trang chủ</span>
        </Link>
      </Button>

      {/* Chủ đề với NavigationMenu */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden lg:inline">Chủ đề</span>
            </NavigationMenuTrigger>
            <NavigationMenuContent className="p-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 min-w-[500px] max-w-[700px] max-h-[400px] overflow-y-auto">
              {chudeList.map((cd) => (
                <Link
                  key={cd.id}
                  href={`/chude/${cd.id}`}
                  className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-muted transition"
                >
                  {getIcon(cd.icon)}
                  {cd.ten}
                </Link>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
    

    {/* Right side: User actions */}
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/thongbao">
              <BellIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Thông báo</span>
            </Link>
          </Button>

          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/tinnhan">
              <MessageCircleIcon className="w-4 h-4" />
              <span className="hidden lg:inline">
                {isPending ? 'Đang tải...' : 'Tin nhắn'}
              </span>
            </Link>
          </Button>

          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link
              href={`/hoso/${
                user.username ?? user.emailAddresses[0].emailAddress.split('@')[0]
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden lg:inline">Hồ sơ</span>
            </Link>
          </Button>
          <ModeToggle />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default">Đăng ký</Button>
        </SignInButton>
      )}
    </div>
    <UserButton />
  </div>
);
}

export default DesktopNavbar;
