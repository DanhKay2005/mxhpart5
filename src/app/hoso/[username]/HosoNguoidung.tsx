"use client";

import { useState } from "react";
import CardBaiViet from "@/components/CardBaiViet";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { capnhatHoso, toggleFollow } from "@/actions/Hoso.action";
import { LayHoSoTuNguoiDung, LayBaivietTuNguoiDung } from "@/actions/Hoso.action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPinIcon,
  LinkIcon,
  CalendarIcon,
  FileTextIcon,
} from "lucide-react";

export type Props = {
  user: NonNullable<Awaited<ReturnType<typeof LayHoSoTuNguoiDung>>>;
  baiviet: any[];
  isOwner: boolean;
};

export default function HosoNguoidung({ user, baiviet, isOwner }: Props) {
  const { user: nguoiDungHienTai } = useUser();
  const [hienThiFormChinhSua, setHienThiFormChinhSua] = useState(false);
  const [dangTheoDoi, setDangTheoDoi] = useState(isOwner);
  const [dangCapNhatTheoDoi, setDangCapNhatTheoDoi] = useState(false);

  const [formChinhSua, setFormChinhSua] = useState({
    ten: user?.ten || "",
    tieusu: user?.tieusu || "",
    diachi: user?.diachi || "",
    website: user?.website || "",
    hinhanh: user?.hinhanh || "",
  });

  const laHoSoCuaToi =
    nguoiDungHienTai?.username === user.username ||
    nguoiDungHienTai?.emailAddresses[0]?.emailAddress.split("@")[0] === user.username;

  const ngayThamGia = format(new Date(user.ngaytao), "MMMM yyyy");

  const handleChinhSua = async () => {
    if (!formChinhSua.ten.trim()) {
      toast.error("❗ Vui lòng nhập tên");
      return;
    }

    const formData = new FormData();
    Object.entries(formChinhSua).forEach(([key, value]) => {
      formData.append(key, value || "");
    });

    const ketqua = await capnhatHoso(formData);
    if (ketqua.success) {
      toast.success("✅ Cập nhật hồ sơ thành công!");
      setHienThiFormChinhSua(false);
    } else {
      toast.error("❌ Lỗi khi cập nhật hồ sơ.");
    }
  };

  const handleTheoDoi = async () => {
    if (!nguoiDungHienTai) return;
    try {
      setDangCapNhatTheoDoi(true);
      await toggleFollow(user.id);
      setDangTheoDoi(!dangTheoDoi);
    } catch {
      toast.error("❌ Lỗi khi cập nhật trạng thái theo dõi");
    } finally {
      setDangCapNhatTheoDoi(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover và Avatar */}
      <div className="max-w-3xl w-full mx-auto">
        <div className="relative rounded-lg shadow">
          <div className="relative h-48 w-full rounded-t-lg overflow-hidden bg-muted" />
          <div className="relative flex flex-col items-center -mt-16 pb-6 px-6">
            <div className="w-32 h-32 border-4 rounded-full overflow-hidden shadow-lg bg-background">
              <Avatar className="w-full h-full rounded-full">
                <AvatarImage src={user.hinhanh ?? "/avatar.png"} />
              </Avatar>
            </div>

            <h1 className="text-2xl font-bold mt-4">{user.ten}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
            <p className="text-sm mt-1 text-center">{user.tieusu}</p>

            <div className="flex gap-6 mt-4 text-center">
              <div>
                <div className="font-bold">{user._count?.dangtheodoi ?? 0}</div>
                <div className="text-sm text-muted-foreground">Đang theo dõi</div>
              </div>
              <div>
                <div className="font-bold">{user._count?.nguoitheodoi ?? 0}</div>
                <div className="text-sm text-muted-foreground">Người theo dõi</div>
              </div>
              <div>
                <div className="font-bold">{user._count?.baiviet ?? 0}</div>
                <div className="text-sm text-muted-foreground">Bài viết</div>
              </div>
            </div>

            {nguoiDungHienTai && (
              laHoSoCuaToi ? (
                <Button className="w-full mt-4" onClick={() => setHienThiFormChinhSua(true)}>
                  ✏️ Chỉnh sửa hồ sơ
                </Button>
              ) : (
                <Button
                  className="w-full mt-4"
                  onClick={handleTheoDoi}
                  disabled={dangCapNhatTheoDoi}
                  variant={dangTheoDoi ? "outline" : "default"}
                >
                  {dangCapNhatTheoDoi
                    ? "Đang xử lý..."
                    : dangTheoDoi
                    ? "👤 Bỏ theo dõi"
                    : "➕ Theo dõi"}
                </Button>
              )
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="flex gap-6 border-b px-6">
            <TabsTrigger value="posts">Bài viết</TabsTrigger>
            <TabsTrigger value="about">Giới thiệu</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="p-6">
            {baiviet.length > 0 ? (
              baiviet.map((post) => (
                <CardBaiViet key={post.id} baiviet={post} DbNguoidungId={user.id} />
              ))
            ) : (
              <div className="text-center text-muted-foreground">Chưa có bài viết</div>
            )}
          </TabsContent>

          <TabsContent value="about" className="p-6 text-sm space-y-2 text-muted-foreground">
            <div><MapPinIcon className="inline w-4 h-4 mr-1" /> {user.diachi || "Chưa cập nhật"}</div>
            <div><LinkIcon className="inline w-4 h-4 mr-1" /> {user.website || "Chưa có website"}</div>
            <div><CalendarIcon className="inline w-4 h-4 mr-1" /> Tham gia {ngayThamGia}</div>
            <div><FileTextIcon className="inline w-4 h-4 mr-1" /> {user.tieusu || "Chưa có tiểu sử"}</div>
          </TabsContent>
        </Tabs>

        {/* Dialog chỉnh sửa */}
        <Dialog open={hienThiFormChinhSua} onOpenChange={setHienThiFormChinhSua}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Tên"
                value={formChinhSua.ten}
                onChange={(e) => setFormChinhSua({ ...formChinhSua, ten: e.target.value })}
              />
              <Textarea
                placeholder="Tiểu sử"
                value={formChinhSua.tieusu}
                onChange={(e) => setFormChinhSua({ ...formChinhSua, tieusu: e.target.value })}
                className="min-h-[100px]"
              />
              <Input
                placeholder="Địa chỉ"
                value={formChinhSua.diachi}
                onChange={(e) => setFormChinhSua({ ...formChinhSua, diachi: e.target.value })}
              />
              <Input
                placeholder="Website"
                value={formChinhSua.website}
                onChange={(e) => setFormChinhSua({ ...formChinhSua, website: e.target.value })}
              />
              <Input
                placeholder="URL ảnh đại diện"
                value={formChinhSua.hinhanh}
                onChange={(e) => setFormChinhSua({ ...formChinhSua, hinhanh: e.target.value })}
              />
              <Button className="w-full" onClick={handleChinhSua}>
                💾 Lưu thay đổi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
