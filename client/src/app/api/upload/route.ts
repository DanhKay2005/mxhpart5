import { NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary tự parse CLOUDINARY_URL từ env
cloudinary.config();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return new Response(
        JSON.stringify({ error: "Không có file hoặc định dạng không hợp lệ" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "mxh_uploads",resource_type: "auto", },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as { secure_url: string });
        }
      );
      stream.end(buffer);
    });

    return new Response(
      JSON.stringify({ url: uploadResult.secure_url }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
