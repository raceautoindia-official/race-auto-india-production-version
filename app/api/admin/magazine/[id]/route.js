import db from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/lib/s3Client";

const currentDate = new Date();
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const year = String(currentDate.getFullYear());
const folderName = `${year}${month}`;

export async function GET(req) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();

    const [rows] = await db.execute("SELECT * FROM newsletter WHERE id = ?", [
      id,
    ]);

    if (rows.length > 0) {
      return NextResponse.json(rows);
    } else {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
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
    const formData = await req.formData();

    const title = formData.get("title");
    const modified_date = formData.get("modified_date");
    const category = formData.get("category");
    const image_url = formData.get("image_url");
    const pdf_url = formData.get("pdf_url");
    const keywords = formData.get("keywords");
    const folderName = "newsletter";

    // Prepare query and params for database update
    let query =
      "UPDATE newsletter SET title = ?, modified_date = ?, category = ?, keywords = ?";
    let queryParams = [title, modified_date, category, keywords];

    // If image is uploaded, process and upload to S3
    if (image_url) {
      const imageFilename = image_url.name;
      const imageFileExtension = imageFilename.split(".").pop();
      const newImageName = `${uuidv4()}.${imageFileExtension}`;
      const imageS3Path = `uploads/${folderName}/${newImageName}`;

      // Convert image file to buffer and upload to S3
      const imageBuffer = Buffer.from(await image_url.arrayBuffer());
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: imageS3Path,
          Body: imageBuffer,
          ContentType: image_url.type,
        })
      );

      // Append image URL to query
      query += ", image_url = ?";
      queryParams.push(imageS3Path);
    }

    // If PDF is uploaded, process and upload to S3
    if (pdf_url) {
      const pdfFilename = pdf_url.name;
      const pdfFileExtension = pdfFilename.split(".").pop();
      const newPdfName = `${uuidv4()}.${pdfFileExtension}`;
      const pdfS3Path = `uploads/${folderName}/${newPdfName}`;

      // Convert PDF file to buffer and upload to S3
      const pdfBuffer = Buffer.from(await pdf_url.arrayBuffer());
      await s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: pdfS3Path,
          Body: pdfBuffer,
          ContentType: pdf_url.type,
        })
      );

      // Append PDF URL to query
      query += ", pdf_url = ?";
      queryParams.push(pdfS3Path);
    }

    // Add WHERE clause for the update
    query += " WHERE id = ?";
    queryParams.push(id);

    // Execute the database query
    await db.execute(query, queryParams);

    return NextResponse.json("Edited successfully");
  } catch (err) {
    console.error("Error updating newsletter:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  try {
    const [rows] = await db.execute(
      "SELECT pdf_url, image_url FROM newsletter WHERE id = ?",
      [id]
    );

    await db.execute(`DELETE FROM newsletter WHERE id = ${id}`);

    return NextResponse.json({ message: "recorded and deleted successfully" });
  } catch (err) {
    console.error("Error submitting form:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
