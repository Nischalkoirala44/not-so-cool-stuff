import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdirSync, existsSync } from "fs";
import { writeFile } from "fs/promises";
import clientPromise from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const caption = formData.get("caption") as string;
    const type = formData.get("type") as string;

    if (!file || !caption || !type) {
      return NextResponse.json({ message: "Missing file, caption, or type" }, { status: 400 });
    }

    const timestamp = Date.now();
    const originalName = file.name;
    const fileName = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const newEntry = {
      file: `uploads/${fileName}`,
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
    console.error("Upload failed:", error);
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
