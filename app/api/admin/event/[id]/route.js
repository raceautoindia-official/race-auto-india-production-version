import { NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import s3Client from "@/lib/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function GET(req) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();

    const [results] = await db.execute("SELECT * FROM event WHERE id = ?", [
      id,
    ]);

    if (results.length > 0) {
      return NextResponse.json(results);
    } else {
      return NextResponse.json({ err: "data not found" }, { status: 404 });
    }
  } catch (err) {
    console.error("Error fetching data from reports:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();
    const currentDate = new Date();
    const year = String(currentDate.getFullYear());
    const folderName = `${year}`;

    const formData = await req.formData();
    const image_url = formData.get("image_url");
    const title = formData.get("title");
    const summary = formData.get("summary");
    const location = formData.get("location");
    const referenceLink = formData.get("referenceLink");
    const event_date = formData.get("event_date");
    const category = formData.get("category");
    const region = formData.get("region");

    let query = `UPDATE event SET title = ?, summary = ?, location = ?, referenceLink = ?, event_date = ?`;
    const values = [title, summary, location, referenceLink, event_date];

    // Optional: Add category and region if provided
    if (category) {
      query += `, category = ?`;
      values.push(category);
    }

    if (region) {
      query += `, region = ?`;
      values.push(region);
    }

    if (image_url) {
      const imageFilename = image_url.name;
      const imageFileExtension = path.extname(imageFilename);
      const newImageName = `${uuidv4()}${imageFileExtension}`;
      const s3Key = `uploads/eventpage/${folderName}/${newImageName}`;
      const imageFileBuffer = Buffer.from(await image_url.arrayBuffer());

      const bucketName = process.env.AWS_S3_BUCKET_NAME;
      const uploadParams = {
        Bucket: bucketName,
        Key: s3Key,
        Body: imageFileBuffer,
        ContentType: image_url.type,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      query += `, image_url = ?`;
      values.push(s3Key);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    const [results] = await db.execute(query, values);
    return NextResponse.json(results);
  } catch (err) {
    console.error("Error updating event:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();

    await db.execute(`DELETE FROM event WHERE id = ${id}`);

    return NextResponse.json({ message: "recorded and deleted successfully" });
  } catch (err) {
    console.error("Error submitting form:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
