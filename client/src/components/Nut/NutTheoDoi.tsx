'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Loader2Icon } from 'lucide-react';
import { toggleFollow, KiemTraDaTheoDoi } from '@/actions/user.action';

export default function NutTheoDoi({ nguoidungId }: { nguoidungId: number }) {
  const [dangTai, setDangTai] = useState(false);
  const [daTheoDoi, setDaTheoDoi] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await KiemTraDaTheoDoi(nguoidungId);
      setDaTheoDoi(res ?? null);
    };

    fetchData();
  }, [nguoidungId]);

  const nhanTheoDoi = async () => {
  setDangTai(true);
  try {
    const res = await toggleFollow(nguoidungId);
    if (res && res.success) {
      setDaTheoDoi((prev) => !prev);
    }
  } catch (error) {
    console.error('Lỗi khi theo dõi:', error);
  } finally {
    setDangTai(false);
  }
};
  if (daTheoDoi === null) {
    return (
      <Button size="sm" variant="secondary" disabled className="w-24">
        <Loader2Icon className="size-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant={daTheoDoi ? 'outline' : 'secondary'}
      onClick={nhanTheoDoi}
      disabled={dangTai}
      className="w-24"
    >
      {dangTai ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : daTheoDoi ? (
        'Đã theo dõi'
      ) : (
        'Theo dõi'
      )}
    </Button>
  );
}