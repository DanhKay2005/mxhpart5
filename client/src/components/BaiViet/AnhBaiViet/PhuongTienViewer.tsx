"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface TacGia {
  id: number;
  ten: string;
  username?: string;
  hinhanh?: string;
}

export interface PhuongTien {
  id: number;
  url: string;
  noidung: string;
  tacgia: {
    id: number;
    ten: string;
    username?: string;
    hinhanh?: string;
  } | null;
}

interface PhuongTienViewerProps {
  dsPhuongTienBaiviet: PhuongTien[];
  currentIndex: number;
  onNext: (nextIndex: number, nextId: number) => void;
  onPrev: (prevIndex: number, prevId: number) => void;
  baivietId: number;
}

export default function PhuongTienViewer({
  dsPhuongTienBaiviet,
  currentIndex,
  onNext,
  onPrev,
  baivietId,
}: PhuongTienViewerProps) {
  if (!dsPhuongTienBaiviet.length || currentIndex === -1)
    return <div className="p-4 text-white">Không có ảnh để hiển thị</div>;

  const phuongTien = dsPhuongTienBaiviet[currentIndex];

  const goPrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevId = dsPhuongTienBaiviet[prevIndex].id;
      onPrev(prevIndex, prevId);
    }
  };

  const goNext = () => {
    if (currentIndex < dsPhuongTienBaiviet.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextId = dsPhuongTienBaiviet[nextIndex].id;
      onNext(nextIndex, nextId);
    }
  };

  const goToIndex = (index: number) => {
    if (index === currentIndex) return;
    if (index > currentIndex) {
      onNext(index, dsPhuongTienBaiviet[index].id);
    } else {
      onPrev(index, dsPhuongTienBaiviet[index].id);
    }
  };

  return (
    <div className="flex-1 bg-black flex flex-col items-center relative select-none">
      {/* Image */}
      <img
        src={phuongTien.url}
        alt={`Ảnh ${phuongTien.id}`}
        className="max-w-full max-h-[80vh] object-contain"
        loading="lazy"
        draggable={false}
      />

      {/* Previous button */}
      {currentIndex > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 hover:bg-opacity-80 text-white p-3 text-4xl rounded-full select-none"
          aria-label="Ảnh trước"
          tabIndex={-1}
        >
          &#8249;
        </button>
      )}

      {/* Next button */}
      {currentIndex < dsPhuongTienBaiviet.length - 1 && (
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 hover:bg-opacity-80 text-white p-3 text-4xl rounded-full select-none"
          aria-label="Ảnh tiếp theo"
          tabIndex={-1}
        >
          &#8250;
        </button>
      )}

      {/* Thumbnail list */}
      <div className="mt-4 flex space-x-2 overflow-x-auto max-w-full px-2">
        {dsPhuongTienBaiviet.map((pt, index) => (
          <button
            key={pt.id}
            onClick={() => goToIndex(index)}
            className={`w-20 h-20 flex-shrink-0 rounded overflow-hidden border-2 focus:outline-none ${
              pt.id === phuongTien.id
                ? "border-blue-500"
                : "border-transparent hover:border-gray-400"
            }`}
            aria-label={`Xem ảnh ${pt.id}`}
            tabIndex={-1}
          >
            <img
              src={pt.url}
              alt={`Ảnh ${pt.id}`}
              className="w-full h-full object-cover"
              loading="lazy"
              draggable={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
