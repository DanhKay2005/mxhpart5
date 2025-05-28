import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/Nut/theme-provider";
import { Toaster } from "react-hot-toast";
import CallListener from "../components/Chat/CallListener";
import SidebarHoso from "@/components/Sidebar/SidebarHoso";


// Custom Fonts
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Metadata
export const metadata: Metadata = {
  title: "Mạng xã hội",
  description: "Được làm bởi Nhóm 4",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              {/* Navbar đã bỏ ra khỏi layout */}
               <Navbar />
               <CallListener />
              <main className="flex-1 pt-0">
                
                <div className="w-full px-4 sm:px-6 lg:px-8">

                  <section className="lg:col-span-10">{children}</section>
                </div>
              </main>
            </div>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

