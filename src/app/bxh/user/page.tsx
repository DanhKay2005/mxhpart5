import { getTopAuthors } from "@/actions/user.action";
import Link from "next/link";

export default async function TopPostsPage() {
  const topPosts = await getTopAuthors();

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-primary mb-4">
        📚 Người đăng nhiều nhất
      </h2>
      <ul className="list-decimal ml-6 space-y-2">
        {topPosts.map((user, index) => (
          <li key={user.id} className="text-sm">
            <Link
              href={`/hoso/${user.username}`}
              className="font-medium text-black hover:underline"
            >
              {user.username}
            </Link>{" "}
            – {user._count.baiviet} bài viết
          </li>
        ))}
      </ul>
    </div>
  );
}