"use client";

import clsx from "clsx";

export function DangHinhAnh({
  src,
  alt,
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt ?? "Ảnh bài viết"}
      loading="lazy"
      className={clsx(
        "mt-4 rounded-xl w-full object-cover max-h-[400px] shadow-md transition-transform hover:scale-[1.01]",
        className
      )}
    />
  );
}
