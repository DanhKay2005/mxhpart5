"use server";
import { searchUsersAndPosts } from "@/actions/timkiem.action";
import CardBaiViet from "@/components/BaiViet/CardBaiViet";
import SidebarTimKiem from "@/components/Sidebar/SidebarTimKiem";
import Link from "next/link";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import NutTheoDoi from "@/components/Nut/NutTheoDoi";

interface User {
  id: number;
  username: string;
  email: string | null;
  ten: string | null;
  ngaytao: string;
  hinhanh?: string | null;
  _count: {
    nguoitheodoi: number;
  };
}

export default async function SearchPage({ searchParams }: { searchParams: { query?: string } }) {
  const query = searchParams.query || "";
  const { users, posts } = await searchUsersAndPosts(query);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-6">
        <SidebarTimKiem />

        <div className="flex-1 space-y-10">
          {users.length === 0 && posts.length === 0 ? (
            <p className="text-gray-500 text-center mt-20 text-lg">Không tìm thấy kết quả.</p>
          ) : (
            <>
              {users.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-5 text-gray-900 dark:text-white">
                    Người dùng
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between bg-muted/40 dark:bg-zinc-900 px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <Link href={`/hoso/${user.username}`}>
                            <Avatar className="w-11 h-11 ring-2 ring-primary/40">
                              <AvatarImage src={user.hinhanh ?? "/avatar.png"} />
                            </Avatar>
                          </Link>
                          <div className="text-sm space-y-1">
                            <Link
                              href={`/hoso/${user.username}`}
                              className="font-medium hover:underline text-foreground dark:text-white text-base"
                            >
                              {user.ten}
                            </Link>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {user._count.nguoitheodoi} người theo dõi
                            </p>
                          </div>
                        </div>
                        <NutTheoDoi nguoidungId={user.id} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {posts.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-5 text-gray-900 dark:text-white">
                    Bài viết
                  </h2>
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <CardBaiViet
                        key={post.id}
                        baiviet={post}
                        DbNguoidungId={post.tacgiaID}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
