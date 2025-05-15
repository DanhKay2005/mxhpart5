"use server";

import prisma from "@/lib/prisma";
import { LayUserBoiId } from "./user.action";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function TaoBaiViet(
  noidung: string,
  hinhanh: string | null,
  chudeID: number
) {
  try {
    const nguoidungId = await LayUserBoiId();
    if (!nguoidungId) return { success: false, message: "Chưa đăng nhập" };

    const baiviet = await prisma.baiviet.create({
      data: {
        noidung,
        hinhanh,
        tacgiaID: nguoidungId,
        chudeID, 
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
            tacgia: {
              select: {
                ten: true,
                hinhanh: true,
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
    if (!nguoidungId) return;

    // Kiểm tra nếu đã yêu thích
    const existingLike = await prisma.yeuthich.findUnique({
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

    // Nếu đã thích => gỡ thích
    if (existingLike) {
      await prisma.$transaction([
        prisma.thongbao.deleteMany({
          where: {
            yeuthichID: existingLike.id,
          },
        }),
        prisma.yeuthich.delete({
          where: {
            nguoidungID_baivietID: {
              nguoidungID: nguoidungId,
              baivietID: baivietID,
            },
          },
        }),
      ]);
    } else {
      // Nếu chưa thích => thêm like + có thể thêm thông báo
      const newLike = await prisma.yeuthich.create({
        data: {
          nguoidungID: nguoidungId,
          baivietID: baivietID,
        },
      });

      // Nếu người thích không phải là tác giả => tạo thông báo
      if (baiviet.tacgiaID !== nguoidungId) {
        await prisma.thongbao.create({
          data: {
            loai: "thich",
            nguoidungID: baiviet.tacgiaID, // người nhận thông báo
            nguoitaoID: nguoidungId,       // người tạo hành động
            baivietID: baivietID,
            yeuthichID: newLike.id,
          },
        });
      }
    }

    // Cập nhật lại path để hiển thị số like mới
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
    const nguoidungID = await LayUserBoiId();

    const baiviet = await prisma.baiviet.findUnique({
      where: { id: baivietID },
      select: { tacgiaID: true },
    });

    if (!baiviet) throw new Error("Không tìm thấy bài viết");
    if (baiviet.tacgiaID !== nguoidungID) throw new Error("Không có quyền xóa bài viết này");

    // Xoá dữ liệu liên quan
    await prisma.$transaction([
      // Xóa thông báo liên quan đến bình luận của bài viết
      prisma.thongbao.deleteMany({
        where: {
          binhluan: {
            baivietID: baivietID,
          },
        },
      }),
      // Xóa thông báo liên quan đến like của bài viết
      prisma.thongbao.deleteMany({
        where: {
          baivietID: baivietID,
        },
      }),
      // Xóa bình luận của bài viết
      prisma.binhluan.deleteMany({
        where: {
          baivietID: baivietID,
        },
      }),
      // Xóa like của bài viết
      prisma.yeuthich.deleteMany({
        where: {
          baivietID: baivietID,
        },
      }),
      // Cuối cùng, xóa bài viết
      prisma.baiviet.delete({
        where: { id: baivietID },
      }),
    ]);

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("❌ Thất bại khi xóa bài viết:", error.message);
    return { success: false, error: error.message || "Thất bại khi xóa bài viết" };
  }
}

// Lấy 5 bài viết mới nhất
export async function getLatestPosts() {
  return prisma.baiviet.findMany({
    orderBy: { ngaytao: 'desc' },
    take: 10,
    include: {
      tacgia: true,
    },
  });
}

// Lấy 5 bài viết nhiều lượt thích nhất
export async function getFeaturedPosts() {
  return prisma.baiviet.findMany({
    orderBy: {
      yeuthich: { _count: 'desc' },
    },
    take: 10,
    include: {
      tacgia: true,
    },
  });
}

export async function getMostLikedPosts() {
  return prisma.baiviet.findMany({
    orderBy: {
      yeuthich: { _count: 'desc' },
    },
    take: 10,
    include: {
      _count: {
        select: { yeuthich: true },
      },
      tacgia: true,
    },
  });
}



