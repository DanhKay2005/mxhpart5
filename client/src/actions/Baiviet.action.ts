"use server";

import prisma from "@/lib/prisma";
import { LayNguoiDungHienTai, LayUserBoiId } from "./user.action";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function TaoBaiViet(
  noidung: string,
  media: { url: string; loai: "image" | "video" }[],
  chudeID: number,
  congkhai: boolean
) {
  try {
    const nguoidungId = await LayUserBoiId();
    if (!nguoidungId) return { success: false, message: "Chưa đăng nhập" };

    const baiviet = await prisma.baiviet.create({
      data: {
        noidung,
        chudeID,
        congkhai,
        tacgiaID: nguoidungId,
        phuongtien: {
          create: media.map((m) => ({
            url: m.url,
            loai: m.loai,
          })),
        },
      },
      include: {
        phuongtien: true,
      },
    });

    revalidatePath("/");
    return { success: true, baiviet };
  } catch (error: any) {
    console.error("🔥 Lỗi khi tạo bài viết:", error.message);
    return { success: false, error: error.message };
  }
}





export async function getBaiViet() {
  try {
    const { userId: clerkId } = await auth();

    // Get current user if logged in
    const currentUser = clerkId
      ? await prisma.user.findUnique({
          where: { clerkId },
        })
      : null;

    // Fetch all posts with related data
    const baivietList = await prisma.baiviet.findMany({
      orderBy: {
        ngaytao: "desc",
      },
       where: {
        OR: [
          { congkhai: true }, // bài công khai thì ai cũng xem được
          { AND: [{ congkhai: false }, { tacgiaID: currentUser?.id }] }, // bài riêng tư chỉ user tạo mới xem được
        ],
        
      },
      include: {
        tacgia: {
          select: {
            id: true,
            ten: true,
            username: true,
            hinhanh: true,
          },
        },
        chude: true,
        binhluan: {
          select: {
            id: true,
            noidung: true,
            ngaytao: true,
            tacgia: {
              select: {
                id:true,
                ten: true,
                hinhanh: true,
                ngaytao: true
              },
            },
          },
        },
        yeuthich: {
          select: {
            id: true,
            nguoidungID: true,
          },
        },
        phuongtien: true, 
        _count: {
          select: {
            yeuthich: true,
            binhluan: true,
          },
        },
      },
    });

    // Add `daThich` field to each post indicating if the current user liked it
    const data = baivietList.map((bv) => ({
      ...bv,
      daThich: currentUser
        ? bv.yeuthich.some((yt) => yt.nguoidungID === currentUser.id)
        : false,
    }));

    return data;
  } catch (error: any) {
    console.error("❌ Lỗi khi lấy danh sách bài viết:", error.message);
    return []; // Hoặc return { success: false, error: error.message } nếu bạn muốn định dạng rõ ràng hơn
  }
}

export async function toggleLike(baivietID: number) {
  try {
    const nguoidungId = await LayUserBoiId();
    if (!nguoidungId) return { success: false, message: "Chưa đăng nhập" };

    if (!baivietID) return { success: false, message: "ID bài viết không hợp lệ" };

    // Kiểm tra nếu đã yêu thích
    const existingLike = await prisma.yeuthichBaiviet.findUnique({
      where: {
        nguoidungID_baivietID: {
          nguoidungID: nguoidungId,
          baivietID: baivietID,
        },
      },
    });

    // Lấy thông tin bài viết để tạo thông báo nếu cần
    const baiviet = await prisma.baiviet.findUnique({
      where: { id: baivietID },
      select: { tacgiaID: true },
    });

    if (!baiviet) throw new Error("Bài viết không tồn tại");

    if (existingLike) {
      await prisma.$transaction([
        prisma.thongbao.deleteMany({
          where: {
            yeuthichBaiID: existingLike.id,
          },
        }),
        prisma.yeuthichBaiviet.delete({
          where: {
            nguoidungID_baivietID: {
              nguoidungID: nguoidungId,
              baivietID: baivietID,
            },
          },
        }),
      ]);
    } else {
      const newLike = await prisma.yeuthichBaiviet.create({
        data: {
          nguoidungID: nguoidungId,
          baivietID: baivietID,
        },
      });

      if (baiviet.tacgiaID !== nguoidungId) {
        await prisma.thongbao.create({
          data: {
            loai: "thich",
            nguoidungID: baiviet.tacgiaID,
            nguoitaoID: nguoidungId,
            baivietID: baivietID,
            yeuthichBaiID: newLike.id,
          },
        });
      }
    }

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Lỗi khi xử lý thích/bỏ thích:", error.message);
    return { success: false, error: "Thất bại trong toggle like" };
  }
}



export async function TaoBinhluan(baivietID: number, noidung: string) {
  try {
    const nguoidungID = await LayUserBoiId();
    if (!nguoidungID) return;
    if (!noidung.trim()) throw new Error("Chưa nhập nội dung");

    const baiviet = await prisma.baiviet.findUnique({
      where: { id: baivietID },
      select: { tacgiaID: true },
    });

    if (!baiviet) throw new Error("Không tìm thấy bài viết");

    const binhluan = await prisma.$transaction(async (tx) => {
      const binhluanMoi = await tx.binhluan.create({
        data: {
          noidung,
          tacgiaID: nguoidungID,
          baivietID: baivietID,
        },
      });

      if (baiviet.tacgiaID !== nguoidungID) {
        await tx.thongbao.create({
          data: {
            loai: "binhluan",
            nguoidungID: baiviet.tacgiaID,
            nguoitaoID: nguoidungID,
            baivietID: baivietID,
            binhluanID: binhluanMoi.id,
          },
        });
      }

      return binhluanMoi;
    });

    revalidatePath(`/baiviet/${baivietID}`);
    return { success: true, binhluan };
  } catch (error: any) {
    console.error(" Thất bại khi tạo bình luận:", error.message);
    return { success: false, error: error.message || "Thất bại khi tạo bình luận" };
  }
}
export async function XoaBaiviet(baivietID: number) {
  try {
    const nguoidung = await LayNguoiDungHienTai(); // { id, role }

    const baiviet = await prisma.baiviet.findUnique({
      where: { id: baivietID },
      select: { tacgiaID: true },
    });

    if (!baiviet) throw new Error("Không tìm thấy bài viết");

    const laTacGia = baiviet.tacgiaID === nguoidung.id;
    const laAdmin = nguoidung.role === "admin";

    if (!laTacGia && !laAdmin) {
      throw new Error("Không có quyền xóa bài viết này");
    }

    const thongBaoAdmin = laAdmin
      ? prisma.thongbao.create({
          data: {
            nguoidungID: baiviet.tacgiaID,
            nguoitaoID: nguoidung.id,
            noidung: "Bài viết của bạn đã vi phạm nguyên tắc cộng đồng và đã bị xoá bởi quản trị viên.",
            loai: "he-thong", 
          },
        })
      : null;

    const giaoTac: any[] = [
  // Xoá thông báo liên quan đến bình luận
  prisma.thongbao.deleteMany({
    where: {
      binhluan: {
        baivietID: baivietID,
      },
    },
  }),
  // Xoá thông báo liên quan đến like bài viết
  prisma.thongbao.deleteMany({
    where: {
      baivietID: baivietID,
    },
  }),
  // Xoá bình luận
  prisma.binhluan.deleteMany({
    where: {
      baivietID: baivietID,
    },
  }),
  prisma.baivietReport.deleteMany({
  where: {
    baivietId: baivietID,
  },
}),
  // Xoá like
  prisma.yeuthichBaiviet.deleteMany({
    where: {
      baivietID: baivietID,
    },
  }),
  // 🆕 Xoá phương tiện (ảnh/video)
  prisma.phuongTien.deleteMany({
    where: {
      baivietId: baivietID,
    },
  }),
  // Cuối cùng là xoá bài viết
  prisma.baiviet.delete({
    where: { id: baivietID },
  }),
];

// Thêm thông báo nếu là admin
if (laAdmin && thongBaoAdmin) giaoTac.push(thongBaoAdmin);

await prisma.$transaction(giaoTac);

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Thất bại khi xóa bài viết:", error.message);
    return {
      success: false,
      error: error.message || "Thất bại khi xóa bài viết",
    };
  }
}



export async function XoaBinhluan(binhluanID: number) {
  try {
    const nguoidungID = await LayUserBoiId();
    if (!nguoidungID) return { success: false, message: "Chưa đăng nhập" };

    // Lấy bình luận kèm bài viết để kiểm tra quyền
    const binhluan = await prisma.binhluan.findUnique({
      where: { id: binhluanID },
      select: {
        tacgiaID: true,
        baiviet: {
          select: { tacgiaID: true, id: true },
        },
      },
    });

    if (!binhluan) return { success: false, message: "Bình luận không tồn tại" };

    // Kiểm tra quyền: chỉ tác giả bình luận hoặc tác giả bài viết mới được xóa
    if (
      binhluan.tacgiaID !== nguoidungID &&
      (!binhluan.baiviet || binhluan.baiviet.tacgiaID !== nguoidungID)
    ) {
      return { success: false, message: "Không có quyền xóa bình luận này" };
    }

    // Xóa thông báo liên quan đến bình luận này (nếu có)
    await prisma.$transaction([
      prisma.thongbao.deleteMany({
        where: { binhluanID: binhluanID },
      }),
      prisma.binhluan.delete({
        where: { id: binhluanID },
      }),
    ]);

    // Cập nhật lại UI trên path bài viết
    if (binhluan.baiviet) {
      revalidatePath(`/baiviet/${binhluan.baiviet.id}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("❌ Lỗi khi xóa bình luận:", error.message);
    return { success: false, message: error.message || "Lỗi khi xóa bình luận" };
  }
}


export async function CapNhatTrangThaiCongKhai(id: number, congkhai: boolean) {
  try {
    const nguoidungID = await LayUserBoiId();
    if (!nguoidungID) return { success: false, message: "Chưa đăng nhập" };

    const baiviet = await prisma.baiviet.findUnique({
      where: { id },
      select: { tacgiaID: true },
    });

    if (!baiviet || baiviet.tacgiaID !== nguoidungID) {
      return { success: false, message: "Không có quyền cập nhật bài viết này" };
    }

    await prisma.baiviet.update({
      where: { id },
      data: { congkhai },
    });

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Lỗi cập nhật công khai:", error);
    return { success: false, message: "Đã xảy ra lỗi trong quá trình cập nhật" };
  }
}



export async function getBaivietById(id: number) {
  try {
    const { userId: clerkId } = await auth();

    // Lấy user hiện tại nếu đăng nhập
    const currentUser = clerkId
      ? await prisma.user.findUnique({
          where: { clerkId },
        })
      : null;

    // Lấy 1 bài viết theo id với điều kiện: 
    // - nếu bài công khai thì ai cũng xem được
    // - nếu bài riêng tư thì chỉ user tạo mới xem được
    const baiviet = await prisma.baiviet.findFirst({
      where: {
        id,
        OR: [
          { congkhai: true },
          { AND: [{ congkhai: false }, { tacgiaID: currentUser?.id }] },
        ],
      },
      include: {
        tacgia: {
          select: {
            id: true,
            ten: true,
            username: true,
            hinhanh: true,
            ngaytao: true,
          },
        },
        chude: true,
        binhluan: {
          select: {
            id: true,
            noidung: true,
            ngaytao: true,
            tacgia: {
              select: {
                id: true,
                ten: true,
                hinhanh: true,
                ngaytao: true,
              },
            },
          },
        },
        yeuthich: {
          select: {
            id: true,
            nguoidungID: true,
          },
        },
        phuongtien: true,
        _count: {
          select: {
            yeuthich: true,
            binhluan: true,
          },
        },
      },
    });

    if (!baiviet) return null;

    const daThich = currentUser
      ? baiviet.yeuthich.some((yt) => yt.nguoidungID === currentUser.id)
      : false;

    return {
      ...baiviet,
      daThich,
    };
  } catch (error: any) {
    console.error("❌ Lỗi khi lấy bài viết theo id:", error.message);
    return null;
  }
}

export async function getPhuongTienVideo() {
  try {
    const { userId: clerkId } = await auth();

    const currentUser = clerkId
      ? await prisma.user.findUnique({
          where: { clerkId },
        })
      : null;

    const baiviets = await prisma.baiviet.findMany({
      orderBy: {
        ngaytao: "desc",
      },
      where: {
        OR: [
          { congkhai: true },
          { AND: [{ congkhai: false }, { tacgiaID: currentUser?.id }] },
        ],
      },
      include: {
        tacgia: {
          select: {
            id: true,
            ten: true,
            username: true,
            hinhanh: true,
            ngaytao: true,
          },
        },
        phuongtien: {
          where: {
            loai: "video",
          },
          select: {
            id: true,
            noidung: true,
            loai: true,
            url: true,
            baivietId: true,
            sanphamId: true,
          },
        },
        chude: true,
        binhluan: {
          select: {
            id: true,
            noidung: true,
            ngaytao: true,
            tacgia: {
              select: {
                id: true,
                ten: true,
                hinhanh: true,
                ngaytao: true,
              },
            },
          },
        },
        yeuthich: {
          select: {
            id: true,
            nguoidungID: true,
          },
        },
        _count: {
          select: {
            yeuthich: true,
            binhluan: true,
          },
        },
      },
    });

    const data = baiviets.map((bv) => ({
      ...bv,
      daThich: bv.yeuthich.some((yt) => yt.nguoidungID === currentUser?.id),
    }));

    return data;
  } catch (error: any) {
    console.error("❌ Lỗi khi lấy danh sách bài viết video:", error.message);
    return [];
  }
}
