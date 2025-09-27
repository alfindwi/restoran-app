import { type NextRequest, NextResponse } from "next/server";
import {z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { v2 as cloudinary } from "cloudinary";

const productSchema = z.object({
  name: z.string().describe("Nama makanan dalam bahasa Indonesia"),
  description: z
    .string()
    .describe(
      "Deskripsi singkat tentang makanan, bahan utama, atau cara penyajian"
    ),
  price: z.number().describe("Estimasi harga (IDR)"),
  category: z.enum(["food"]).describe("Kategori produk, selalu 'food'"),
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

    // Upload ke Cloudinary
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

    // Panggil OpenRouter
    const llm = new ChatOpenAI({
      modelName: "openai/gpt-4o-mini",
      temperature: 0,
      maxTokens: 500,
      openAIApiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "AI Product Extractor",
        },
      },
    }).withStructuredOutput(productSchema);

    console.log(
      "🔑 OPENROUTER_API_KEY:",
      process.env.OPENROUTER_API_KEY ? "FOUND" : "NOT FOUND"
    );

    const result = await llm.invoke([
      ["system", "Kamu adalah AI yang mendeskripsikan makanan Indonesia."],
      [
        "human",
        [
          { type: "image_url", image_url: imageUrl },
          {
            type: "text",
            text: `Analisis gambar ini dan kembalikan hasil dalam format JSON:
        {
          "name": string,
          "description": string,
          "price": number,
          "category": "food"
        }

        Ketentuan harga:
        - makanan sederhana: 8000-15000 IDR
        - makanan tradisional: 15000-35000 IDR
        - premium: 35000-60000 IDR`,
          },
        ],
      ],
    ]);

    return NextResponse.json({ ...result, image_url: imageUrl });
  } catch (error) {
    console.error("Error extracting product info:", error);
   
  }
}
