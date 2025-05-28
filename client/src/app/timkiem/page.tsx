"use server";
import { searchUsersAndPosts } from "@/actions/timkiem.action";
import CardBaiViet from "@/components/BaiViet/CardBaiViet";
import Link from "next/link";

interface User {
  id: number;
  username: string;
  email: string | null;
  ten: string | null;
  ngaytao: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams.query || "";
  const { users, posts } = await searchUsersAndPosts(query);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Kết quả tìm kiếm cho: "<span className="text-blue-600">{query}</span>"
      </h1>

      {users.length === 0 && posts.length === 0 ? (
        <p className="text-gray-500 text-center mt-10 text-lg">Không tìm thấy kết quả.</p>
      ) : (
        <>
          {users.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Người dùng</h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/hoso/${user.username}`}
                    className="flex items-center p-4 border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold mr-4">
                      {(user.ten ?? user.username)[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-medium text-gray-900">
                        {user.ten || user.username}
                      </p>
                      {user.email && (
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      )}
                      {user.ngaytao && (
                        <p className="text-xs text-gray-400 mt-1">
                          Tham gia: {new Date(user.ngaytao).toLocaleDateString("vi-VN")}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {posts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Bài viết</h2>
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
  );
}
