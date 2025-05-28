"use client";

import { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import LeftSidebar from "@/components/Chat/LeftSidebar";
import RightSidebar from "@/components/Chat/RightSidebar";
import { useParams } from "next/navigation";

function Page() {
  // Lấy param clerkId trực tiếp từ router
  const params = useParams();
  const clerkIdParam = params?.clerkId;
  const clerkId = Array.isArray(clerkIdParam) ? clerkIdParam[0] : clerkIdParam || "";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => setIsMobile(window.innerWidth <= 768);
    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
    return () => window.removeEventListener("resize", checkScreenWidth);
  }, []);

  // Debug xem clerkId thay đổi đúng không
  useEffect(() => {
    console.log("Current clerkId param:", clerkId);
  }, [clerkId]);

  return (
    <div className="h-[90vh]">
      <ResizablePanelGroup direction="horizontal" className="h-full flex min-h-0">
        <ResizablePanel
          defaultSize={isMobile ? 15 : 20}
          collapsedSize={isMobile ? 5 : 10}
          minSize={isMobile ? 10 : 15}
          maxSize={isMobile ? 20 : 30}
          collapsible
          onCollapse={() => setIsCollapsed(true)}
          onExpand={() => setIsCollapsed(false)}
          className={`border-r overflow-y-auto flex flex-col transition-width duration-300 ${
            isCollapsed ? "min-w-[60px]" : "min-w-[200px]"
          }`}
        >
          <LeftSidebar isCollapsed={isCollapsed} BanId={clerkId} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel className="flex flex-col overflow-hidden flex-1 min-h-0">
          <RightSidebar BanId={clerkId} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default Page;
