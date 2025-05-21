"use client";

import { useState, useEffect } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import LeftSidebar from "@/components/Chat/LeftSidebar";
import RightSidebar from "@/components/Chat/RightSidebar";

function Page({ params }: { params: { clerkId: string } }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenWidth = () => setIsMobile(window.innerWidth <= 768);
    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
    return () => window.removeEventListener("resize", checkScreenWidth);
  }, []);

  return (
    <div className="h-[90vh]">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full flex min-h-0"
      >
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
          <LeftSidebar isCollapsed={isCollapsed}  />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel className="flex flex-col overflow-hidden flex-1 min-h-0">
          <RightSidebar  />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default Page;
