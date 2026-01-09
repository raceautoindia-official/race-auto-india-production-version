export const dynamic = "force-dynamic";

import db from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from 'path'
import s3Client from "@/lib/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const currentDate = new Date();
const year = String(currentDate.getFullYear());
const folderName = `${year}`;

export async function GET() {
  try {
    const [results] = await db.execute(
      `SELECT * FROM event_settings WHERE id = 1`
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error("Error submitting form:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  const formData = await req.formData();
  const banner_image = formData.get("banner_image");
  const event_1 = formData.get("event_1");
  const event_2 = formData.get("event_2");
  const event_1_link = formData.get("event_1_link");
  const event_2_link = formData.get("event_2_link");
  const event_1_visible = formData.get("event_1_visible");
  const event_2_visible = formData.get("event_2_visible");
  const banner_content = formData.get("banner_content");

  try {
    let query =
      "UPDATE event_settings SET event_1_link = ?, event_2_link = ?, event_1_visible = ?, event_2_visible = ?, banner_content = ?";

    const values = [
      event_1_link,
      event_2_link,
      event_1_visible == "true" || event_1_visible == 1 ? 1 : 0,
      event_2_visible == "true" || event_2_visible == 1 ? 1 : 0,
      banner_content,
    ];

    const currentYear = new Date().getFullYear();
    const folderName = `uploads/eventpage/${currentYear}`;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    // Helper function to upload files to S3
    const uploadToS3 = async (file, folder) => {
      const imageFilename = file.name;
      const imageFileExtension = path.extname(imageFilename);
      const newImageName = `${uuidv4()}${imageFileExtension}`;
      const s3Key = `${folder}/${newImageName}`;
      const imageFileBuffer = Buffer.from(await file.arrayBuffer());

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: imageFileBuffer,
          ContentType: file.type, // Set content type
        })
      );

      return s3Key;
    };

    // Upload banner image
    if (banner_image) {
      const bannerImageKey = await uploadToS3(banner_image, folderName);
      query += ", banner_image = ?";
      values.push(bannerImageKey);
    }

    // Upload event_1 image
    if (event_1) {
      const event1ImageKey = await uploadToS3(event_1, folderName);
      query += ", upcoming_event_1 = ?";
      values.push(event1ImageKey);
    }

    // Upload event_2 image
    if (event_2) {
      const event2ImageKey = await uploadToS3(event_2, folderName);
      query += ", upcoming_event_2 = ?";
      values.push(event2ImageKey);
    }

    // Add WHERE clause
    query += " WHERE id = 1";

    // Execute query
    await db.execute(query, values);

    return NextResponse.json({ message: "Updated successfully" });
  } catch (err) {
    console.error("Error submitting form:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
