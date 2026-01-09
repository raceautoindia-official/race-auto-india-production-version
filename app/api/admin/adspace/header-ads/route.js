import { NextResponse } from "next/server";
import db from "@/lib/db";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import s3Client from "@/lib/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";


// Upload helper
async function uploadToS3(file, folder = "uploads/ads") {
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
  const [results] = await db.execute("SELECT * FROM header_ads ORDER BY sort_order ASC");
  return NextResponse.json(results);
}



export async function POST(req) {
  const formData = await req.formData();
  const link = formData.get("link_url");
  const sort = parseInt(formData.get("sort_order")) || 0;
  const image = formData.get("image");

  const imageKey = await uploadToS3(image);

  await db.execute(
    "INSERT INTO header_ads (image_url, link_url, sort_order) VALUES (?, ?, ?)",
    [imageKey, link, sort]
  );

  return NextResponse.json({ message: "Ad created successfully" });
}


export async function PUT(req) {
  const formData = await req.formData();
  const id = formData.get("id");
  const link = formData.get("link_url");
  const sort = parseInt(formData.get("sort_order")) || 0;
  const image = formData.get("image");

  let setClause = "link_url = ?, sort_order = ?";
  const params = [link, sort];

  if (image && typeof image.name === "string") {
    const imageKey = await uploadToS3(image);
    setClause += ", image_url = ?";
    params.push(imageKey);
  }

  params.push(id);

  await db.execute(`UPDATE header_ads SET ${setClause} WHERE id = ?`, params);
  return NextResponse.json({ message: "Ad updated successfully" });
}

// DELETE: Remove by ID
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await db.execute("DELETE FROM header_ads WHERE id = ?", [id]);
  return NextResponse.json({ message: "Deleted successfully" });
}
