import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { GoogleGenerativeAI } from "@google/generative-ai";

const productSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.enum(["food"]),
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type CloudinaryResult = {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "menu" }, (error, result) => {
            if (error || !result) reject(error);
            else resolve(result as CloudinaryResult);
          })
          .end(buffer);
      }
    );

    const imageUrl = uploadResponse.secure_url;
    console.log("📸 IMAGE_URL:", imageUrl);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
      Analisis gambar makanan ini dan kembalikan hasil dalam JSON murni tanpa teks tambahan.
      Format:
      {
        "name": string,
        "description": string,
        "price": number,
        "category": "food"
      }

      Ketentuan harga:
      - makanan sederhana: 8000-15000 IDR
      - makanan tradisional: 15000-35000 IDR
      - premium: 35000-60000 IDR
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: image.type,
          data: buffer.toString("base64"),
        },
      },
      { text: prompt },
    ]);

    let text = result.response.text();
    console.log("AI Raw Output:", text);

    let cleanText = text.trim();

    const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      cleanText = match[1];
    }

    const parsed = productSchema.safeParse(JSON.parse(cleanText));

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid AI output", issues: parsed.error.format(), raw: cleanText },
        { status: 400 }
      );
    }

    return NextResponse.json({ ...parsed.data, image_url: imageUrl });
  } catch (error) {
    console.error("Error extracting product info:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
