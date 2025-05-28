import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Hàm gộp class Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Hàm sao chép vào clipboard
export function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      console.log("Copied to clipboard:", text);
    });
  } else {
    // Fallback cho trình duyệt cũ
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
}
