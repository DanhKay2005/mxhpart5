"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAllChude } from "@/actions/Chude.action";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ChevronUp, BarChart, FolderOpen } from "lucide-react";
import BXHUserSidebar from "@/components/BXHUserSidebar";

export default function Sidebar() {
  const [chude, setChude] = useState<{ id: number; ten: string }[]>([]);
  const [hienChude, setHienChude] = useState(false);
  const [hienBXH, setHienBXH] = useState(false);

  useEffect(() => {
    async function fetchChude() {
      const data = await getAllChude();
      setChude(data);
    }
    fetchChude();
  }, []);

  return (
    <div className="sticky top-20 space-y-6">
      {/* Toggle Chủ đề */}
      <Card>
        <CardHeader
          className="flex flex-row justify-between items-center cursor-pointer"
          onClick={() => setHienChude(!hienChude)}
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <CardTitle className="text-base">Khám phá chủ đề</CardTitle>
          </div>
          {hienChude ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CardHeader>
        {hienChude && (
          <CardContent className="space-y-2 pt-0">
            {chude.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có chủ đề nào.</p>
            ) : (
              chude.map((cd) => (
                <Link
                  href={`/chude/${cd.id}`}
                  key={cd.id}
                  className="block text-muted-foreground hover:underline text-sm"
                >
                  {cd.ten}
                </Link>
              ))
            )}
          </CardContent>
        )}
      </Card>

      {/* Toggle Bảng xếp hạng */}
      <Card>
        <CardHeader
          className="flex flex-row justify-between items-center cursor-pointer"
          onClick={() => setHienBXH(!hienBXH)}
        >
          <div className="flex items-center gap-2">
            <BarChart className="w-4 h-4" />
            <CardTitle className="text-base">Bảng xếp hạng</CardTitle>
          </div>
          {hienBXH ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </CardHeader>
        {hienBXH && (
          <CardContent className="pt-0">
            <BXHUserSidebar />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
