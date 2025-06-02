"use client";

import {
  BellIcon,
  HomeIcon,
  UserIcon,
  MessageCircleIcon,
  LayoutGrid,
  SearchIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModeToggle } from '@/components/Nut/ModeToggle';
import { getAllChude } from '@/actions/Chude.action';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
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
    <header className="hidden md:flex items-center justify-between w-full max-w-7xl mx-auto px-6 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left: Logo + Navigation */}
      <div className="flex items-center space-x-5">
        {/* Search */}
        <form onSubmit={handleSearch} className="relative max-w-sm">
          <Input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 h-9 rounded-full text-sm"
          />
          <SearchIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        </form>

        {/* Home */}
        <Link href="/" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
          <HomeIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Trang chủ</span>
        </Link>

        {/* Chủ đề */}
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="gap-1 text-sm">
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

      {/* Right: User Actions */}
      <div className="flex items-center space-x-8">
        {user ? (
          <>
            <Link href="/thongbao" className="text-muted-foreground hover:text-foreground">
              <BellIcon className="w-5 h-5" />
            </Link>
            <Link href="/tinnhan" className="text-muted-foreground hover:text-foreground">
              <MessageCircleIcon className="w-5 h-5" />
            </Link>
            <Link
              href={`/hoso/${
                user.username ?? user.emailAddresses[0].emailAddress.split('@')[0]
              }`}
              className="text-muted-foreground hover:text-foreground"
            >
              <UserIcon className="w-5 h-5" />
            </Link>
            <ModeToggle />
          </>
        ) : (
          <SignInButton mode="modal">
            <Button size="sm" className="rounded-full px-4 py-1.5 text-sm">
              Đăng ký
            </Button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}

export default DesktopNavbar;
