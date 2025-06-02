"use server";

import { searchUsersAndPosts } from "@/actions/timkiem.action";
import CardBaiViet from "@/components/BaiViet/CardBaiViet";
import SidebarTimKiem from "@/components/Sidebar/SidebarTimKiem";

export default async function SearchPostsPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const query = searchParams.query || "";
  const { posts } = await searchUsersAndPosts(query);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      
      <div className="flex flex-col  sm:flex-row  gap-6">
               <SidebarTimKiem />
    
        <div className="flex-1">
      {posts.length === 0 ? (
        <p className="text-gray-500 text-center mt-10 text-lg">Không tìm thấy bài viết nào.</p>
      ) : (
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
    </div>
    </div>
    </div>
  );
}
