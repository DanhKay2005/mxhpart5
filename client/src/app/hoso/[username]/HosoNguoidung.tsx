"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CardBaiViet from "@/components/BaiViet/CardBaiViet";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  capnhatHoso,
  toggleFollow,
  LayHoSoTuNguoiDung,
  LayBaivietTuNguoiDung,
} from "@/actions/Hoso.action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPinIcon, LinkIcon, CalendarIcon, FileText } from "lucide-react";
import { getFriends } from "@/actions/banbe.action";
import NutTheoDoi from "@/components/Nut/NutTheoDoi";

type User = {
  id: number;
  name: string;
  username: string;
  avatarUrl?: string;
};

export type Props = {
  user: NonNullable<Awaited<ReturnType<typeof LayHoSoTuNguoiDung>>>;
  baiviet: any[];
  isOwner: boolean;
};

export default function HosoNguoidung({ user, baiviet, isOwner }: Props) {
  const { user: currentUser } = useUser();
  const router = useRouter();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(isOwner);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  const [formEdit, setFormEdit] = useState({
    ten: user?.ten || "",
    tieusu: user?.tieusu || "",
    diachi: user?.diachi || "",
    website: user?.website || "",
    hinhanh: user?.hinhanh || "",
  });

  const isMyProfile =
    currentUser?.username === user.username ||
    currentUser?.emailAddresses[0]?.emailAddress.split("@")[0] === user.username;

  const ngayThamGia = format(new Date(user.ngaytao), "MMMM yyyy");

  // --- Danh sách bạn bè ---
  const [friends, setFriends] = useState<User[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingToggleFriendId, setLoadingToggleFriendId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchFriends() {
      setLoadingFriends(true);
      try {
        const data = await getFriends(user.id);
        // Map dữ liệu thành User[]
        const mapped = data.map((u: any) => ({
          id: Number(u.id),
          name: u.ten ?? "Không tên",
          username: u.username,
          avatarUrl: u.hinhanh || "/default-avatar.png",
        }));
        setFriends(mapped);
      } catch (error) {
        toast.error("Lỗi khi tải danh sách bạn bè");
        console.error(error);
      } finally {
        setLoadingFriends(false);
      }
    }
    if (user?.id) {
      fetchFriends();
    }
  }, [user?.id]);

  async function handleSaveProfile() {
    if (!formEdit.ten.trim()) {
      toast.error("❗ Vui lòng nhập tên");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(formEdit).forEach(([key, value]) => formData.append(key, value || ""));
      const res = await capnhatHoso(formData);

      if (res.success) {
        toast.success("✅ Cập nhật hồ sơ thành công!");
        setIsEditOpen(false);
        router.refresh();
      } else {
        toast.error("❌ Lỗi khi cập nhật hồ sơ.");
      }
    } catch {
      toast.error("❌ Lỗi khi cập nhật hồ sơ.");
    }
  }

  async function handleFollowToggle() {
    if (!currentUser) return;
    setIsUpdatingFollow(true);
    try {
      await toggleFollow(user.id);
      setIsFollowing(!isFollowing);
    } catch {
      toast.error("❌ Lỗi khi cập nhật trạng thái theo dõi");
    } finally {
      setIsUpdatingFollow(false);
    }
  }

  // Toggle follow với bạn bè trong danh sách
  async function handleToggleFriendFollow(friendId: number) {
    setLoadingToggleFriendId(friendId);
    try {
      await toggleFollow(friendId);
      toast.success("Cập nhật trạng thái bạn bè thành công");
      // Nếu bạn muốn cập nhật lại danh sách bạn bè có thể gọi fetchFriends lại hoặc update state tùy ý
    } catch {
      toast.error("Lỗi khi cập nhật trạng thái bạn bè");
    } finally {
      setLoadingToggleFriendId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header Profile */}
        <div className="relative rounded-lg shadow bg-white dark:bg-gray-800 overflow-hidden">
          <div className="h-48 bg-muted rounded-t-lg" />
          <div className="flex flex-col items-center -mt-20 pb-8 px-6">
            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-700">
              <Avatar className="w-full h-full rounded-full">
                <AvatarImage src={user.hinhanh ?? "/avatar.png"} />
              </Avatar>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">{user.ten}</h1>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <p className="mt-2 text-center text-gray-600 dark:text-gray-300 max-w-md">{user.tieusu}</p>

            {/* Stats */}
            <div className="flex gap-10 mt-6 text-center">
              <div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">{user._count?.dangtheodoi || 0}</div>
                <div className="text-sm text-muted-foreground">Đang theo dõi</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">{user._count?.nguoitheodoi || 0}</div>
                <div className="text-sm text-muted-foreground">Người theo dõi</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-gray-900 dark:text-white">{user._count?.baiviet || 0}</div>
                <div className="text-sm text-muted-foreground">Bài viết</div>
              </div>
            </div>

            {/* Buttons */}
            {currentUser && (
              <div className="mt-6 w-full max-w-sm flex gap-3">
                {isMyProfile ? (
                  <Button variant="default" className="flex-1" onClick={() => setIsEditOpen(true)}>
                    ✏️ Chỉnh sửa hồ sơ
                  </Button>
                ) : (
                  <>
                    <Button
                      className="flex-1"
                      onClick={handleFollowToggle}
                      disabled={isUpdatingFollow}
                      variant={isFollowing ? "outline" : "default"}
                    >
                      {isUpdatingFollow ? "Đang xử lý..." : isFollowing ? "👤 Bỏ theo dõi" : "➕ Theo dõi"}
                    </Button>
                    <Button
                      className="flex-1"
                      variant="secondary"
                      onClick={() => router.push(`/tinnhan/t/${user.clerkId}`)}
                    >
                      💬 Nhắn tin
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="mt-10">
          <TabsList className="border-b px-6">
            <TabsTrigger value="posts" className="text-lg font-medium">
              Bài viết
            </TabsTrigger>
            <TabsTrigger value="about" className="text-lg font-medium">
              Giới thiệu
            </TabsTrigger>
            <TabsTrigger value="banbe" className="text-lg font-medium">
              Bạn bè
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="p-6 space-y-6">
            {baiviet.length ? (
              baiviet.map((post) => <CardBaiViet key={post.id} baiviet={post} DbNguoidungId={user.id} />)
            ) : (
              <p className="text-center text-muted-foreground">Chưa có bài viết</p>
            )}
          </TabsContent>

          <TabsContent value="about" className="p-6 space-y-3 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <MapPinIcon className="w-5 h-5" />
              <span>{user.diachi || "Chưa cập nhật địa chỉ"}</span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              <span>{user.website || "Chưa có website"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              <span>Tham gia {ngayThamGia}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText  className="w-5 h-5" />
                    <p>{user.tieusu || "Chưa có tiểu sử"}</p>
               </div>
           </TabsContent>
                 <TabsContent value="banbe" className="p-6 space-y-3 text-muted-foreground text-sm">
        {loadingFriends ? (
          <p>Đang tải bạn bè...</p>
        ) : friends.length === 0 ? (
          <p>Chưa có bạn bè nào.</p>
        ) : (
          <ul className="space-y-4">
            {friends.map((friend) => (
              <li key={friend.id} className="flex items-center gap-3">
                <img
                  src={friend.avatarUrl || "/default-avatar.png"}
                  alt={friend.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold">{friend.name}</p>
                  <p className="text-sm text-muted-foreground">@{friend.username}</p>
                </div>
                  <NutTheoDoi nguoidungId={friend.id} />
              </li>
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>

    {/* Dialog chỉnh sửa hồ sơ */}
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input
            type="text"
            placeholder="Tên"
            value={formEdit.ten}
            onChange={(e) => setFormEdit((f) => ({ ...f, ten: e.target.value }))}
          />
          <Textarea
            placeholder="Tiểu sử"
            rows={3}
            value={formEdit.tieusu}
            onChange={(e) => setFormEdit((f) => ({ ...f, tieusu: e.target.value }))}
          />
          <Input
            type="text"
            placeholder="Địa chỉ"
            value={formEdit.diachi}
            onChange={(e) => setFormEdit((f) => ({ ...f, diachi: e.target.value }))}
          />
          <Input
            type="text"
            placeholder="Website"
            value={formEdit.website}
            onChange={(e) => setFormEdit((f) => ({ ...f, website: e.target.value }))}
          />
          <Input
            type="text"
            placeholder="URL hình ảnh đại diện"
            value={formEdit.hinhanh}
            onChange={(e) => setFormEdit((f) => ({ ...f, hinhanh: e.target.value }))}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveProfile}>Lưu</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</div>
  )}
