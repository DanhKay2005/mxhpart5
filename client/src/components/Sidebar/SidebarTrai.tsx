import React from "react";
import SidebarHoso from "./SidebarHoso";
import Sidebar from "./Sidebar";
import { Separator } from "../ui/separator";

export default function Sidebarfull() {
  return (
    <div className="sticky top-20 space-y-4">
      <SidebarHoso />
      <Separator />
      <Sidebar />
    </div>
  );
}
