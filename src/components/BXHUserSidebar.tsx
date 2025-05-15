import Link from "next/link";

export default function BXHUserSidebar() {
  return (
    <div className="space-y-2 text-sm">
      <Link href="/bxh/user" className="text-muted-foreground hover:underline block">
        📚 Người đăng nhiều nhất
      </Link>
      <Link href="/bxh/follow" className="text-muted-foreground hover:underline block">
        🔥 Người được theo dõi nhiều nhất
      </Link>
    </div>
  );
}
