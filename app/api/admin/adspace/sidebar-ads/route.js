import { NextResponse } from "next/server";
import db from "@/lib/db";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import s3Client from "@/lib/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

// Upload helper, now with a guard
async function uploadToS3(file, folder = "uploads/ads") {
  if (!file || typeof file.name !== "string") {
    throw new Error("No file provided");
  }

  const ext = path.extname(file.name);
  const fileName = `${uuidv4()}${ext}`;
  const s3Key = `${folder}/${fileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return s3Key;
}

export async function GET() {
  const [results] = await db.execute(
    "SELECT * FROM sidebar_ads ORDER BY sort_order ASC"
  );
  return NextResponse.json(results);
}

export async function POST(req) {
  const formData = await req.formData();
  const link = formData.get("link_url")?.toString() || "";
  const sort = parseInt(formData.get("sort_order")?.toString() || "0", 10);
  const image = formData.get("image");

  // Guard: image is required on create
  if (!image || typeof image.name !== "string") {
    return NextResponse.json(
      { error: "Image file is required" },
      { status: 400 }
    );
  }

  let imageKey;
  try {
    imageKey = await uploadToS3(image);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }

  await db.execute(
    "INSERT INTO sidebar_ads (image_url, link_url, sort_order) VALUES (?, ?, ?)",
    [imageKey, link, sort]
  );

  return NextResponse.json({ message: "Ad created successfully" });
}

export async function PUT(req) {
  const formData = await req.formData();
  const id = formData.get("id")?.toString();
  const link = formData.get("link_url")?.toString() || "";
  const sort = parseInt(formData.get("sort_order")?.toString() || "0", 10);
  const image = formData.get("image");

  if (!id) {
    return NextResponse.json(
      { error: "ID is required for update" },
      { status: 400 }
    );
  }

  let setClause = "link_url = ?, sort_order = ?";
  const params = [link, sort];

  // Only upload if a new file was provided
  if (image && typeof image.name === "string") {
    try {
      const imageKey = await uploadToS3(image);
      setClause += ", image_url = ?";
      params.push(imageKey);
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to upload new image" },
        { status: 500 }
      );
    }
  }

  params.push(id);

  await db.execute(
    `UPDATE sidebar_ads SET ${setClause} WHERE id = ?`,
    params
  );
  return NextResponse.json({ message: "Ad updated successfully" });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { error: "ID is required for deletion" },
      { status: 400 }
    );
  }
  await db.execute("DELETE FROM sidebar_ads WHERE id = ?", [id]);
  return NextResponse.json({ message: "Deleted successfully" });
}
