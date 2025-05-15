import { getMostFollowedUsers } from "@/actions/user.action";
import Link from "next/link";

export default async function TopFollowsPage() {
  const topFollows = await getMostFollowedUsers();

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-primary mb-4">
        🔥 Người được theo dõi nhiều nhất
      </h2>
      <ul className="list-decimal ml-6 space-y-2">
        {topFollows.map((user, index) => (
          <li key={user.id} className="text-sm">
            <Link
              href={`/hoso/${user.username}`}
              className="font-medium text-black hover:underline"
            >
              {user.username}
            </Link>{" "}
            – {user._count.nguoitheodoi} lượt theo dõi
          </li>
        ))}
      </ul>
    </div>
  );
}