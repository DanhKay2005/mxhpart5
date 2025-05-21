"use client";

export function DangHinhAnh({ src, alt }: { src: string; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt ?? "Ảnh bài viết"}
      loading="lazy"
      className="mt-4 rounded-xl w-full object-cover max-h-[400px] shadow-md transition-transform hover:scale-[1.01]"
    />
  );
}