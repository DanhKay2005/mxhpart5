"use server";
import prisma from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function BaocaoBaiviet(baivietId: number, lydo: string) {
  const { userId } = await auth();
  if (!userId) {
    return { success: false, message: "Bạn cần đăng nhập để thực hiện thao tác này." }
  }

  const nguoidung = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!nguoidung) {
    return { success: false, message: "Không tìm thấy người dùng trong hệ thống." }
  }

  try {
    await prisma.baivietReport.create({
      data: {
        baivietId,
        lydo,
        nguoidungId: nguoidung.id,
      },
    })

    return { success: true, message: "Báo cáo của bạn đã được gửi thành công." }
  } catch (error) {
    console.error("Lỗi khi báo cáo bài viết:", error)
    return { success: false, message: "Đã xảy ra lỗi khi gửi báo cáo." }
  }
}