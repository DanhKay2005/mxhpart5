// "use client";

// import React from "react";
// import Link from "next/link";
// import { Bell, MessageCircle, UserCircle, Sun, Moon } from "lucide-react";
// import CartIcon from "./CartIcon";

// export default function Header() {
//   return (
//     <header className="flex items-center justify-between p-4 bg-white shadow-md sticky top-0 z-50">
//       <div className="flex items-center space-x-4">
//         <Link href="/" className="text-xl font-bold">
//           Diễn đàn sinh viên DNC
//         </Link>
//         <nav className="hidden md:flex space-x-4">
//           <Link href="/" className="hover:underline">
//             Trang chủ
//           </Link>
//           <Link href="/chude" className="hover:underline">
//             Chủ đề
//           </Link>
//           <Link href="/thongbao" className="hover:underline">
//             Thông báo
//           </Link>
//           <Link href="/tin-nhan" className="hover:underline">
//             Tin nhắn
//           </Link>
//           <Link href="/hoso" className="hover:underline">
//             Hồ sơ
//           </Link>
//         </nav>
//       </div>

//       <div className="flex items-center space-x-4">
//         <button
//           aria-label="Toggle theme"
//           className="p-2 rounded hover:bg-gray-200"
//           onClick={() => {
//             // Simple theme toggle logic (can be improved)
//             if (document.documentElement.classList.contains("dark")) {
//               document.documentElement.classList.remove("dark");
//             } else {
//               document.documentElement.classList.add("dark");
//             }
//           }}
//         >
//           <Sun className="w-5 h-5" />
//         </button>

//         <Bell className="w-5 h-5 cursor-pointer" />
//         <MessageCircle className="w-5 h-5 cursor-pointer" />
//         <UserCircle className="w-5 h-5 cursor-pointer" />

//         <CartIcon />
//       </div>
//     </header>
//   );
// }
