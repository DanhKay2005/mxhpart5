"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function SidebarQuangCao() {
  const ads = [
    {
      id: 1,
      title: "Trường Đại học Nam Cần Thơ công bố phương thức và tổ hợp xét tuyển sinh đại học chính quy năm 2025 (dự kiến)",
      imageUrl: "/hinhanh/Pic1.png",
      link: "https://tuyensinh.nctu.edu.vn/news/2025/truong-dai-hoc-nam-can-tho-cong-bo-phuong-thuc-tuyen-sinh-dai-hoc-chinh-quy-nam-2025-du-kien",
    },
    {
      id: 2,
      title: "Lễ Khai mạc Hội thao sinh viên DNC lần thứ XII - Năm học 2025-2026",
      imageUrl: "/hinhanh/pic2.jpg",
      link: "https://nctu.edu.vn/news/le-khai-mac-hoi-thao-sinh-vien-dnc-lan-thu-xii-nam-hoc-2025-2026",
    },
    {
      id: 3,
      title: "Vòng Tay Yêu Thương – Thắp Sáng Nụ Cười Trẻ Thơ",
      imageUrl: "/hinhanh/Pic3.png",
      link: "https://nctu.edu.vn/events/vong-tay-yeu-thuong-thap-sang-nu-cuoi-tre-tho",
    },
  ];

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Tự động chuyển quảng cáo mỗi 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads.length]);

  const currentAd = ads[currentAdIndex];

  return (
    <aside className="w-[360px] rounded-xl space-y-4 sticky top-24 h-fit flex flex-col justify-between">
  <div>
    <Link
      href={currentAd.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-lg overflow-hidden hover:shadow-lg transition duration-200 border border-gray-200"
      key={currentAd.id}
    >
      <div className="relative w-full h-48">
        <Image
          src={currentAd.imageUrl}
          alt={currentAd.title}
          layout="fill"
          objectFit="cover"
          className="transition duration-300 hover:scale-105"
        />
      </div>
      <div className="p-3 text-base font-semibold text-gray-800 hover:text-blue-600">
        {currentAd.title}
      </div>
    </Link>
  </div>

  <div className="pt-4 border-t mt-4 text-center">
    <Link
      href="https://nctu.edu.vn/"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition"
    >
      <Image src="/hinhanh/DNC-LOGO.png" alt="NCTU Logo" width={28} height={28} />
      <span className="font-medium">nctu.edu.vn</span>
    </Link>
  </div>
</aside>
  );
}
