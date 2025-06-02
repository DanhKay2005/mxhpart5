import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node"; // ✅ đúng chỗ

import { getAllBaocaos } from "@/actions/Baocao.action";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) redirect("/");

  const user = await clerkClient.users.getUser(userId as string);
  const role = user.publicMetadata.role;

  if (role !== "admin") redirect("/");


  const baocaos = await getAllBaocaos();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📋 Danh sách báo cáo</h1>
      <div className="space-y-4">
        {baocaos.map((bc) => (
          <div
            key={bc.id}
            className="border rounded-lg p-4 shadow-sm bg-white dark:bg-zinc-800"
          >
            <p><strong>Bài viết ID:</strong> {bc.baivietId}</p>
            <p><strong>Người báo cáo:</strong> {bc.nguoidungId}</p>
            <p><strong>Lý do:</strong> {bc.lydo}</p>
            <Link
              href={`/baiviet/${bc.baivietId}`}
              className="text-blue-500 underline mt-2 inline-block"
            >
              Xem bài viết
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}