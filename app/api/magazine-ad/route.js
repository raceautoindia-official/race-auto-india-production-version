export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/lib/s3Client";

const currentDate = new Date();
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const year = String(currentDate.getFullYear());
const folderName = `${year}${month}`;

export async function GET() {
  try {
    const [results] = await db.execute(
      `SELECT * FROM newsletter_ad WHERE id = 1`
    );

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json("internal server error", { status: 500 });
  }
}

export async function PUT(req) {
  const formData = await req.formData();
  const title = formData.get("title");
  const description = formData.get("description");
  const edition_name = formData.get("edition_name");
  const thumbnail = formData.get("thumbnail");

  try {
    if (!thumbnail) {
      await db.execute(
        `UPDATE newsletter_ad SET title = ?, description = ?, edition_name = ? WHERE id = 1`,
        [title, description, edition_name]
      );
      return NextResponse.json("updated");
    }

    // Generate a unique filename for the thumbnail
    const imageFilename = thumbnail.name;
    const imageFileExtension = imageFilename.split(".").pop();
    const newImageName = `${uuidv4()}.${imageFileExtension}`;

    // Define the S3 path for the thumbnail
    const folderName = "newsletter"; // Replace with your desired folder name
    const thumbnailS3Path = `uploads/${folderName}/${newImageName}`;

    // Convert thumbnail file to a buffer
    const thumbnailBuffer = Buffer.from(await thumbnail.arrayBuffer());

    // Upload the thumbnail to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME, // Replace with your S3 bucket name
        Key: thumbnailS3Path,
        Body: thumbnailBuffer,
        ContentType: thumbnail.type, // Ensure the correct MIME type is set
      })
    );

    // Save the S3 path to the database
    const query = [title, description, thumbnailS3Path, edition_name];
    await db.execute(
      `UPDATE newsletter_ad SET title = ?, description = ?, thumbnail = ?, edition_name = ? WHERE id = 1`,
      query
    );

    return NextResponse.json("updated success");
  } catch (err) {
    console.error("Error during PUT request:", err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}
