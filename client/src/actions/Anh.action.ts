"use server";

import prisma from "@/lib/prisma";
import { LayUserBoiId } from "./user.action";
import { revalidatePath } from "next/cache";

// Lấy duy nhất 1 bài viết theo id kèm data liên quan như ảnh, bình luận ảnh, like ảnh,...
 export async function getBaivietById(id: number) {
  const userId = await LayUserBoiId();

  const hinhanh = await prisma.phuongTien.findUnique({
    where: { id },
    select: {
      id: true,
      url: true,
      loai: true,
      noidung: true,
      Yeuthich: {
        select: {
          nguoidungID: true,
        },
      },
      _count: {
        select: {
          Binhluan: true,
          Yeuthich: true,
        },
      },
      baiviet: {
        select: {
          id: true,
          noidung: true,
          ngaytao: true,
          chude: true,
          tacgia: {
            select: {
              id: true,
              username: true,
              ten: true,
              ngaytao: true,
              hinhanh: true,
            },
          },
        },
      },
      Binhluan: {
        select: {
          id: true,
          noidung: true,
          ngaytao: true,
          tacgia: {
            select: {
              id: true,
              username: true,
              ten: true,
              hinhanh: true,
            },
          },
        },
      },
    },
  });

  if (!hinhanh) return null;

  // Kiểm tra user đã thích ảnh này chưa
  const daThich = userId
    ? hinhanh.Yeuthich.some((yt) => yt.nguoidungID === userId)
    : false;

  // Tách yeuthich khỏi hinhanh để tránh dư thừa
  const { Yeuthich, ...hinhanhRest } = hinhanh;

  // Tách riêng binhluan của ảnh (hinhanh)
  const binhluanAnh = hinhanhRest.Binhluan || [];

  // Tách bài viết chính
  const baiViet = hinhanhRest.baiviet || null;

  return {
    phuongTien: {
      ...hinhanhRest,
      daThich,
      binhluanAnh,
    },
    baiViet,
  };
}

// Toggle like ảnh (phương tiện) theo id ảnh
export async function LuotThich(anhId: number) {
  try {
    const nguoidungID = await LayUserBoiId();
    if (!nguoidungID) {
      return { success: false, message: "Chưa đăng nhập" };
    }

    // Lấy thông tin ảnh và bài viết cha
    const hinhAnh = await prisma.phuongTien.findUnique({
      where: { id: anhId },
      select: {
        baivietId: true,
        baiviet: { select: { tacgiaID: true, id: true } },
      },
    });
    if (!hinhAnh) {
      return { success: false, message: "Không tìm thấy ảnh" };
    }

    // Kiểm tra người dùng đã like ảnh này chưa (dựa vào nguoidungID + phuongtienID)
    const existing = await prisma.yeuthichPhuongTien.findFirst({
      where: {
        nguoidungID: nguoidungID,
        phuongtienID: anhId,
      },
    });

    if (existing) {
      // Nếu đã like rồi, gỡ like và xóa thông báo liên quan
      await prisma.$transaction([
        prisma.thongbao.deleteMany({ where: { yeuthichAnhID: existing.id } }),
        prisma.yeuthichPhuongTien.delete({
          where: {
            nguoidungID_phuongtienID: {
              nguoidungID,
              phuongtienID: anhId,
            },
          },
        }),
      ]);
    } else {
      // Tạo mới like ảnh, set baivietID = null để không gây lỗi unique với like bài viết
      const newLike = await prisma.yeuthichPhuongTien.create({
        data: {
          nguoidungID,
          phuongtienID: anhId,
        },
      });

      // Tạo thông báo nếu người like không phải chủ bài viết
      const tacgiaID = hinhAnh.baiviet?.tacgiaID;
      if (tacgiaID && tacgiaID !== nguoidungID) {
        await prisma.thongbao.create({
          data: {
            loai: "thichAnh",
            nguoidungID: tacgiaID,
            nguoitaoID: nguoidungID,
            baivietID: hinhAnh.baiviet.id,
            yeuthichAnhID: newLike.id,
          },
        });
      }
    }

    // Revalidate lại trang bài viết chứa ảnh
    if (hinhAnh.baiviet?.id) {
      revalidatePath(`/baiviet/${hinhAnh.baiviet.id}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("❌ Lỗi khi xử lý like ảnh:", error.message);
    return { success: false, error: error.message };
  }
}

// Tạo bình luận cho ảnh
export async function TaoBinhluan(anhId: number, noidung: string) {
  try {
    const nguoidungID = await LayUserBoiId();
    if (!nguoidungID) {
      return { success: false, message: "Chưa đăng nhập" };
    }
    if (!noidung.trim()) {
      return { success: false, message: "Chưa nhập nội dung" };
    }

    // Kiểm tra ảnh tồn tại và lấy tacgia của bài viết cha (nếu cần gửi thông báo)
    const hinhAnh = await prisma.phuongTien.findUnique({
      where: { id: anhId },
      select: {
        baivietId: true,
        baiviet: { select: { tacgiaID: true, id: true } },
      },
    });
    if (!hinhAnh) {
      return { success: false, message: "Không tìm thấy ảnh" };
    }

    // Tạo bình luận chỉ với phuongtienID
    const binhluan = await prisma.binhluan.create({
      data: {
        noidung,
        tacgiaID: nguoidungID,
        phuongtienID: anhId,
        baivietID: null,     // explicit null
      },
    });

    // Tạo thông báo cho tác giả bài viết nếu comment trên ảnh và khác người comment
    const tacgiaID = hinhAnh.baiviet?.tacgiaID;
    if (tacgiaID && tacgiaID !== nguoidungID) {
      await prisma.thongbao.create({
        data: {
          loai: "binhluanAnh",
          nguoidungID: tacgiaID,
          nguoitaoID: nguoidungID,
          baivietID: hinhAnh.baiviet.id,
          binhluanID: binhluan.id,
        },
      });
    }

    // Revalidate để reload lại page bài viết chứa ảnh
    if (hinhAnh.baiviet?.id) {
      revalidatePath(`/baiviet/${hinhAnh.baiviet.id}`);
    }

    return { success: true, binhluan };
  } catch (error: any) {
    console.error("❌ Thất bại khi tạo bình luận ảnh:", error.message);
    return { success: false, error: error.message };
  }
}

// Xóa ảnh (phuongTien) và các dữ liệu liên quan
export async function XoaPhuongTien(anhId: number) {
  try {
    const nguoidungID = await LayUserBoiId();
    if (!nguoidungID) throw new Error("Không xác định được người dùng");

    const phuongTien = await prisma.phuongTien.findUnique({
      where: { id: anhId },
      select: { baiviet: { select: { tacgiaID: true, id: true } } },
    });

    if (!phuongTien || phuongTien.baiviet?.tacgiaID !== nguoidungID) {
      throw new Error("Không có quyền xóa ảnh này");
    }

    await prisma.$transaction([
      prisma.thongbao.deleteMany({
        where: {
          OR: [
            { binhluan: { phuongtienID: anhId } },
            { yeuthichAnh: { phuongtienID: anhId } },
          ],
        },
      }),
      prisma.binhluan.deleteMany({ where: { phuongtienID: anhId } }),
      prisma.yeuthichPhuongTien.deleteMany({ where: { phuongtienID: anhId } }),
      prisma.phuongTien.delete({ where: { id: anhId } }),
    ]);

    revalidatePath(`/baiviet/${phuongTien.baiviet.id}`);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Thất bại khi xóa ảnh:", error.message);
    return { success: false, error: error.message || "Thất bại khi xóa ảnh" };
  }
}

// Xóa bình luận ảnh
export async function XoaBinhluanAnh(binhluanID: number) {
  try {
    const nguoidungID = await LayUserBoiId();
    if (!nguoidungID) return { success: false, message: "Chưa đăng nhập" };

    const binhluan = await prisma.binhluan.findUnique({
      where: { id: binhluanID },
      select: {
        tacgiaID: true,
        phuongtien: { select: { id: true, baiviet: { select: { id: true, tacgiaID: true } } } },
      },
    });

    if (!binhluan) return { success: false, message: "Bình luận không tồn tại" };

    if (
      binhluan.tacgiaID !== nguoidungID &&
      binhluan.phuongtien?.baiviet.tacgiaID !== nguoidungID
    ) {
      return { success: false, message: "Không có quyền xóa bình luận này" };
    }

    await prisma.$transaction([
      prisma.thongbao.deleteMany({ where: { binhluanID } }),
      prisma.binhluan.delete({ where: { id: binhluanID } }),
    ]);

    revalidatePath(`/baiviet/${binhluan.phuongtien?.baiviet.id}`);
    return { success: true };
  } catch (error: any) {
    console.error("❌ Lỗi khi xóa bình luận ảnh:", error.message);
    return { success: false, message: error.message || "Lỗi khi xóa bình luận ảnh" };
  }
}
export async function getPhuongTienByBaivietId(baivietId: number) {
  return await prisma.phuongTien.findMany({
    where: { baivietId },
    select: {
      id: true,
      url: true,
      loai: true,
      noidung: true,
      baivietId: true,
      baiviet: {
        select: {
          tacgia: {
            select: {
              id: true,
              ten: true,
              username: true,
              hinhanh: true,
            },
          },
        },
      },
    },
  });
}

// Lấy danh sách bình luận của một phương tiện (ảnh)
export async function getBinhluanAnh(phuongtienId: number) {
  return await prisma.binhluan.findMany({
    where: { phuongtienID: phuongtienId },
    orderBy: { ngaytao: "desc" },
    select: {
      id: true,
      noidung: true,
      tacgiaID: true,
      ngaytao: true,
      ngaycapnhat: true,
      tacgia: {
        select: {
          id: true,
          ten: true,
          hinhanh: true,
        },
      },
    },
  });
}

// Lấy danh sách người thích (like) của một phương tiện (ảnh)
export async function getYeuthichAnh(phuongtienId: number) {
  return await prisma.yeuthichPhuongTien.findMany({
    where: { phuongtienID: phuongtienId },
    orderBy: { ngaytao: "desc" },
    select: {
      id: true,
      nguoidungID: true,
      ngaytao: true,
      nguoidung: {
        select: {
          id: true,
          ten: true,
          hinhanh: true,
        },
      },
    },
  });
}


export async function getPhuongTienById(id: number) {
  if (!id) return null;

  const phuongTien = await prisma.phuongTien.findUnique({
    where: { id },
    select: {
      id: true,
      url: true,
      loai: true,
      noidung: true,
      baivietId: true,
      baiviet: {
        select: {
          id: true,
          noidung: true,
          ngaytao: true,
          tacgia: {
            select: {
              id: true,
              ten: true,
              username: true,
              hinhanh: true,
            },
          },
        },
      },
      Yeuthich: {
        select: {
          nguoidungID: true,
        },
      },
      Binhluan: {
        select: {
          id: true,
          noidung: true,
          ngaytao: true,
          tacgia: {
            select: {
              id: true,
              ten: true,
              hinhanh: true,
            },
          },
        },
      },
      _count: {
        select: {
          Binhluan: true,
          Yeuthich: true,
        },
      },
    },
  });

  return phuongTien;
}

