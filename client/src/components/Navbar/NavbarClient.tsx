"use client";

import Link from "next/link";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

export default function NavbarClient() {
  return (
    <nav className="sticky top-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
         {/* Logo as Image */}
        <Link href="/" className="flex items-center">
          <img 
            src="/hinhanh/furiya.png"   // đường dẫn tương đối từ public folder
            alt="Huriya Logo" 
            className="h-20 w-auto"  // điều chỉnh kích thước ảnh
          />
          <div  className="text-2xl sm:text-3xl font-bold text-primary font-mono tracking-wide">Furiya</div>
        </Link>

        {/* Desktop Navigation (hidden on small screens) */}
        <div className="hidden md:flex w-full ml-8">
          <DesktopNavbar />
        </div>

        {/* Mobile Navigation (visible on small screens) */}
        <div className="md:hidden">
          <MobileNavbar />
        </div>
      </div>
    </nav>
  );
}
