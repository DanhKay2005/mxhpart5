"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";


export default function NavbarClient() {
  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary font-mono tracking-wider">
              Diễn đàn sinh viên DNC
            </Link>
          </div>
          <div className="desktop-navbar">
            <DesktopNavbar />
          </div>
          <MobileNavbar />
        </div>
      </div>
    </nav>
  );
}

