  'server client';

  import React from 'react';
  import Link from 'next/link';
  import { RandomNguoiDung } from '@/actions/user.action';
  import { Card, CardHeader, CardContent, CardTitle } from './ui/card';
  import { Avatar, AvatarImage } from './ui/avatar';
  import  NutTheoDoi  from './NutTheoDoi';

  export default async function AiDaTheoDoi() {
    const nguoidung = await RandomNguoiDung();

    if (!nguoidung || nguoidung.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Những người bạn có thể sẽ biết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {nguoidung.map((user) => (
              <div key={user.id} className="flex gap-2 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link href={`/hoso/${user.username}`}>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={user.hinhanh ?? '/avatar.png'} />
                    </Avatar>
                  </Link>
                  <div className="text-xs">
                    <Link href={`/hoso/${user.username}`} className="font-medium cursor-pointer">
                      {user.ten}
                    </Link>
                    <p className="text-muted-foreground">@{user.username}</p>
                    <p className="text-muted-foreground">{user._count.nguoitheodoi} người theo dõi</p>
                  </div>
                </div>
                <NutTheoDoi nguoidungId={user.id} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
