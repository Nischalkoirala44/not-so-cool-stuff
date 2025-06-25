import { type NextRequest, NextResponse } from "next/server";
import { Writable } from "stream";
import clientPromise from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";

interface CloudinaryUploadResult {
  secure_url: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = formData.get("caption") as string | null;
    const type = formData.get("type") as string | null;

    if (!file || !caption || !type) {
      return NextResponse.json({ message: "Missing file, caption, or type" }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary with typed Promise
    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "blog_uploads",
          resource_type: type === "video" ? "video" : "image",
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error("No result from Cloudinary"));
          resolve(result as CloudinaryUploadResult);
        }
      );

      (uploadStream as Writable).end(buffer);
    });

    const newEntry = {
      file: uploadResult.secure_url,
      caption,
      type,
      date: new Date().toISOString().split("T")[0],
    };

    const client = await clientPromise;
    const db = client.db("blogDB");
    const collection = db.collection("uploads");

    await collection.insertOne(newEntry);

    return NextResponse.json({ message: "Upload successful", file: newEntry });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    return NextResponse.json({ message: "Server error", error: `${error}` }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("blogDB");
    const collection = db.collection("uploads");

    const uploads = await collection.find().sort({ date: -1 }).toArray();

    return NextResponse.json({ uploads });
  } catch (error) {
    console.error("Failed to fetch uploads:", error);
    return NextResponse.json({ message: "Failed to fetch", error: `${error}` }, { status: 500 });
  }
}

