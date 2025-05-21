"use client";

import getthongbao, { DanhdauThongbao } from '@/actions/thongbao.action';
import ThongbaoSkeleton from '@/components/Thongbao/ThongbaoSkeleton';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { HeartIcon, MessageCircleIcon, UserPlusIcon } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useRouter } from 'next/navigation';

type ThongbaoType = Awaited<ReturnType<typeof getthongbao>>;

const renderIcon = (loai: string | null) => {
  switch (loai) {
    case "thich":
      return <HeartIcon className="size-4 text-red-500" />;
    case "binhluan":
      return <MessageCircleIcon className="size-4 text-blue-500" />;
    case "theodoi":
      return <UserPlusIcon className="size-4 text-green-500" />;
    default:
      return null;
  }
};

function Pagethongbao() {
  const [thongbao, setthongbao] = useState<ThongbaoType>([]);
  const [DangTai, setDangTai] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchThongbao = async () => {
      try {
        const data = await getthongbao();
        setthongbao(data);

        const chuaDoc = data.filter(n => !n.daXem).map(n => n.id);
        if (chuaDoc.length > 0) await DanhdauThongbao(chuaDoc);
      } catch (error) {
        toast.error("Lỗi trong việc đánh dấu thông báo");
      } finally {
        setDangTai(false);
      }
    };

    fetchThongbao();
  }, []);

  const danhDauTatCa = async () => {
    const chuaDoc = thongbao.filter(n => !n.daXem).map(n => n.id);
    if (chuaDoc.length > 0) {
      await DanhdauThongbao(chuaDoc);
      setthongbao((prev) =>
        prev.map((n) => ({ ...n, daXem: true }))
      );
    }
  };

  // Gộp thông báo theo ngày
  const grouped: Record<string, ThongbaoType> = {};
  thongbao.forEach((n) => {
    const dateKey = format(new Date(n.ngaytao), "yyyy-MM-dd");
    grouped[dateKey] = grouped[dateKey] || [];
    grouped[dateKey].push(n);
  });

  if (DangTai) return <ThongbaoSkeleton />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Thông báo</CardTitle>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {thongbao.filter((n) => !n.daXem).length} chưa đọc
              </span>
              <button
                onClick={danhDauTatCa}
                className="text-sm text-blue-600 hover:underline"
              >
                Đánh dấu đã đọc tất cả
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {thongbao.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">Không có thông báo</div>
            ) : (
              Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">
                    {format(new Date(date), "dd/MM/yyyy")}
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-4 p-4 border-b hover:bg-muted/25 transition-colors cursor-pointer ${
                        !item.daXem ? "bg-muted/50" : ""
                      }`}
                      onClick={() => item.baivietID && router.push(`/baiviet/${item.baivietID}`)}
                    >
                      <Avatar className="mt-1 w-8 h-8">
                        <AvatarImage src={item.nguoitao.hinhanh ?? "/avatar.png"} />
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {renderIcon(item.loai)}
                          <span>
                            <span className="font-medium">
                              {item.nguoitao.ten ?? item.nguoitao.username}
                            </span>{" "}
                            {item.loai === "theodoi"
                              ? "đã bắt đầu theo dõi bạn"
                              : item.loai === "thich"
                              ? "đã thích bài viết của bạn"
                              : "đã bình luận bài viết của bạn"}
                          </span>
                        </div>

                        {/* Hiển thị nội dung bài viết nếu có */}
                        {item.baivietID &&
                          (item.loai === "thich" || item.loai === "binhluan") &&
                          item.baiviet && (
                            <div className="pl-6 space-y-2">
                              <div className="text-sm text-muted-foreground rounded-md p-2 bg-muted/30 mt-2">
                                <p>{item.baiviet.noidung}</p>
                                {item.baiviet.hinhanh && (
                                  <img
                                    src={item.baiviet.hinhanh}
                                    alt="Ảnh bài viết"
                                    className="mt-2 rounded-md w-full max-w-[200px] h-auto object-cover"
                                  />
                                )}
                              </div>
                            </div>
                          )}

                        {/* Thời gian */}
                        <p className="text-sm text-muted-foreground pl-6">
                          {formatDistanceToNow(new Date(item.ngaytao), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default Pagethongbao;