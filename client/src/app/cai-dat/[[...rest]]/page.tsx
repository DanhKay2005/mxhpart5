"use client";

import { UserProfile, SignOutButton } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "signout">("profile");

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-lg font-semibold mb-4">Cài đặt</h2>
        <ul className="space-y-2">
          <li>
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              onClick={() => setActiveTab("profile")}
              className="w-full flex items-center justify-start gap-2"
            >
              <User size={18} />
              Hồ sơ người dùng
            </Button>
          </li>
          <li>
            <SignOutButton>
              <Button
                variant={activeTab === "signout" ? "destructive" : "ghost"}
                className="w-full flex items-center justify-start gap-2 mt-2"
              >
                <LogOut size={18} />
                Đăng xuất
              </Button>
            </SignOutButton>
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
  {activeTab === "profile" && (
    <div className="w-full max-w-3xl">
      <UserProfile
        routing="path"
        path="/cai-dat"
        appearance={{
          elements: {
            rootBox: "shadow-none",
          },
        }}
      />
    </div>
  )}
</div>
    </div>
  );
}
