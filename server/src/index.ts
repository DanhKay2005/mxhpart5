import express, { Express } from "express";
import { createServer, Server as HTTPServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import { Server as SocketIOServer, Socket } from "socket.io";
import prisma from "./prisma";  // Prisma ORM kết nối CSDL
import crypto from "crypto";   // Dùng để tạo hash phòng chat duy nhất

dotenv.config();  // Load biến môi trường từ .env

const app: Express = express();
app.use(cors());
app.use(express.json());

const httpServer: HTTPServer = createServer(app);

const io: SocketIOServer = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Lắng nghe kết nối mới từ client
io.on("connection", (socket: Socket) => {
  const userId = socket.handshake.query.userId as string;

  if (userId) {
    socket.join(userId);  // Mỗi user sẽ join vào room riêng với ID của họ
    console.log(`🔌 ${userId} connected`);
  }

  // 🎥 Cuộc gọi video
  socket.on("initialiseCall", (data, nguoiNhanId) => {
    console.log("📞 Cuộc gọi bắt đầu", data);
    io.to(nguoiNhanId).emit("Cuộc gọi tới", {
      from: data.from,
      roomID: data.roomID,
    });
  });

  // ❌ Người nhận từ chối cuộc gọi
   socket.on("rejectCall", (data, BanId) => {
    console.log(`${data.from} reject the call`)
    // Phát lại event rejectCall cho người gọi
    io.to(BanId).emit("CallRejected");
  });

  // 💬 Gửi tin nhắn chat
  socket.on("guiTinnhan", async (tinnhan: {
    nguoiGuiId: string;
    nguoiNhanId: string;
    noidung: string;
    id: number;
    ngaytao: Date;
  }) => {
    const { nguoiGuiId, nguoiNhanId, noidung } = tinnhan;

    if (!nguoiGuiId || !nguoiNhanId) {
      socket.emit("error", "Thiếu người gửi hoặc người nhận.");
      return;
    }

    try {
      const luuTinnhan = await prisma.tinNhan.create({
        data: {
          nguoiGuiId,
          nguoiNhanId,
          noidung,
        },
      });

      // 🔑 Tạo uniqueKey (ID phòng chat) từ 2 ID người dùng
      const KetHopData = [nguoiGuiId, nguoiNhanId].sort().join("");
      const hash = crypto.createHash("sha256").update(KetHopData).digest("hex");
      const uniqueKey = `chat:${hash}:tinnhan:update`;

      // 📡 Phát sự kiện cho tất cả client đang theo dõi uniqueKey
      io.emit(uniqueKey, { ...luuTinnhan });
    } catch (error) {
      console.error("❗ Lỗi khi gửi tin nhắn:", error);
      socket.emit("error", "Tin nhắn lỗi khi gửi.");
    }
  });

  // 👋 Khi client disconnect
  socket.on("disconnect", () => {
    console.log(`⚡ ${userId} đã ngắt kết nối`);
  });
});

const port = process.env.PORT || 8080;

httpServer.listen(port, () => {
  console.log(`[Server]: Server đang chạy tại http://localhost:${port}`);
});
