export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import s3Client from "@/lib/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function GET() {
  try {
    const [result] = await db.execute(
      `SELECT logo, logo_footer, logo_email, favicon FROM general_settings WHERE id = 1`
    );
    return NextResponse.json(result);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const formData = await req.formData();

    const logo = formData.get("logo");
    const logo_footer = formData.get("logo_footer");
    const logo_email = formData.get("logo_email");
    const favicon = formData.get("favicon");

    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    let query = "UPDATE general_settings SET";
    let queryParams = [];

    // Helper function to handle S3 uploads
    const uploadToS3 = async (file, folder) => {
      const fileExtension = path.extname(file.name);
      const newFileName = `${uuidv4()}${fileExtension}`;
      const s3Key = `${folder}/${newFileName}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      const uploadParams = {
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: file.type,
     
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      return s3Key; // Return the public URL
    };

    // Dynamic query construction for file fields
    if (logo) {
      const logoUrl = await uploadToS3(logo, "uploads/logo");
      query += " logo = ?,";
      queryParams.push(logoUrl);
    }
    if (logo_footer) {
      const logoFooterUrl = await uploadToS3(logo_footer, "uploads/logo");
      query += " logo_footer = ?,";
      queryParams.push(logoFooterUrl);
    }
    if (logo_email) {
      const logoEmailUrl = await uploadToS3(logo_email, "uploads/logo");
      query += " logo_email = ?,";
      queryParams.push(logoEmailUrl);
    }
    if (favicon) {
      const faviconUrl = await uploadToS3(favicon, "uploads/logo");
      query += " favicon = ?,";
      queryParams.push(faviconUrl);
    }

    // Finalizing query
    query = query.slice(0, -1); // Remove the trailing comma
    query += " WHERE id = 1";

    // Execute database query
    await db.execute(query, queryParams);

    return NextResponse.json({ message: "Logos updated successfully" });
  } catch (error) {
    console.error("Error updating general settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
