import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import db from "@/lib/db";
import schedule from "node-schedule";
import s3Client from "@/lib/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const currentDate = new Date();
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const year = String(currentDate.getFullYear());
const folderName = `${year}${month}`;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const title = formData.get("title");
    const slug = formData.get("title_slug");
    const content = formData.get("content");
    const summary = formData.get("summary");
    const category_id = formData.get("category_id");
    const keywords = formData.get("keywords");
    const tags = formData.get("tags");
    const is_slider = formData.get("is_slider");
    const is_featured = formData.get("is_featured");
    const is_recommended = formData.get("is_recommended");
    const is_breaking = formData.get("is_breaking");
    const user_id = formData.get("user_id");
    const image_description = formData.get("image_description");
    const market = formData.get("market");
    const draftValue = formData.get("draft");
    const scheduled = formData.get("schedule_time");

    const scheduleTime =
      scheduled === null || scheduled === "" || scheduled === undefined
        ? 0
        : new Date(scheduled) < new Date()
        ? 0
        : 1;
    const draft = draftValue == "true" ? 0 : 1;

    const title_slug = slug
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase()
      .split(" ")
      .join("-");

    const tags_split = tags.split(",");

    const files = [];

    // Collect all files from formData
    for (const [key, value] of formData.entries()) {
      if (value instanceof Blob) {
        files.push(value);
      }
    }

    const firstFile = files[0];
    const firstFilename = firstFile.name;
    const imageFileExtension = firstFilename.split(".").pop();
    const newImageName = `${uuidv4()}.${imageFileExtension}`;
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const folderPath = `uploads/images/${folderName}`;

    // Read the first file into a buffer
    const firstFileBuffer = Buffer.from(await firstFile.arrayBuffer());

    // Define the S3 upload function
    const uploadToS3 = async (buffer, key, contentType) => {
      const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      };
      await s3Client.send(new PutObjectCommand(uploadParams));
      return `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${key}`;
    };

    // Upload original image
    const originalKey = `${folderPath}/${newImageName}`;
    const image_default = await uploadToS3(
      firstFileBuffer,
      originalKey,
      firstFile.type
    );

    // Resize and upload large image
    const largeKey = `${folderPath}/750_${newImageName}`;
    const image_big = await sharp(firstFileBuffer)
      .resize(750, 500)
      .toBuffer()
      .then((buffer) => uploadToS3(buffer, largeKey, "image/jpeg"));

    // Resize and upload small image
    const smallKey = `${folderPath}/140_${newImageName}`;
    const image_small = await sharp(firstFileBuffer)
      .resize(140, 90)
      .toBuffer()
      .then((buffer) => uploadToS3(buffer, smallKey, "image/jpeg"));

    // Resize and upload medium image
    const mediumKey = `${folderPath}/380_${newImageName}`;
    const image_mid = await sharp(firstFileBuffer)
      .resize(380, 226)
      .toBuffer()
      .then((buffer) => uploadToS3(buffer, mediumKey, "image/jpeg"));

    // Prepare database values
    const img_default = `uploads/images/${folderName}/${newImageName}`;
    const img_big = `uploads/images/${folderName}/750_${newImageName}`;
    const img_small = `uploads/images/${folderName}/140_${newImageName}`;
    const img_mid = `uploads/images/${folderName}/380_${newImageName}`;

    const postQuery = [
      title,
      title_slug,
      keywords,
      summary,
      content,
      category_id,
      img_big,
      img_default,
      img_mid,
      img_small,
      is_slider,
      is_featured,
      is_recommended,
      user_id,
      is_breaking,
      image_description,
      market,
      draft,
      scheduleTime,
    ];
    const [postResult] = await db.execute(
      `
        INSERT INTO posts (
          title, title_slug, keywords, summary, content, category_id, image_big, image_default, 
          image_mid, image_small, is_slider, is_featured, is_recommended, user_id,
          is_breaking, image_description, market, status, is_scheduled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      postQuery
    );

    const postId = postResult.insertId;

    for (const item of tags_split) {
      const tag_slug = item
        .trim()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .toLowerCase()
        .split(" ")
        .join("-");
      await db.execute(
        `INSERT INTO tags (post_id, tag, tag_slug) VALUES (?, ?, ?)`,
        [postId, item, tag_slug]
      );
    }

    if (scheduled) {
      const publishTime = new Date(scheduled);
      const currentTime = new Date();

      // Check if the scheduled time is in the past
      if (publishTime < currentTime) {
        await db.execute(`UPDATE posts SET created_at = ? WHERE id = ?`, [
          publishTime,
          postId,
        ]);
        console.log("Scheduled time is in the past. No action taken.");
      } else {
        schedule.scheduleJob(publishTime, async function () {
          await db.execute(
            `UPDATE posts SET is_scheduled = 0, created_at = ? WHERE id = ?`,
            [postId, publishTime]
          );
          console.log(`Post with ID ${postId} is now published.`);
        });
      }
    }

    // Handle remaining files (additional images)
    if (files.length > 1) {
      const remainingFiles = files.slice(1);

      const filePromises = remainingFiles.map(async (file) => {
        const originalFilename = file.name;
        const imageFileExtension = originalFilename.split(".").pop();
        const newImageName = `${uuidv4()}.${imageFileExtension}`;
        const additionalKey = `${folderPath}/${newImageName}`;

        // Read the remaining file into a buffer and upload it directly to S3
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const additionalImageDefault = await uploadToS3(
          fileBuffer,
          additionalKey,
          file.type
        );

        // Resize additional images and upload them to S3
        const additionalLargeKey = `${folderPath}/750_${newImageName}`;
        const additionalImageBig = await sharp(fileBuffer)
          .resize(750, 500)
          .toBuffer()
          .then((buffer) =>
            uploadToS3(buffer, additionalLargeKey, "image/jpeg")
          );

        const img_default = `uploads/images/${folderName}/${newImageName}`;
        const img_big = `uploads/images/${folderName}/750_${newImageName}`;

        // Insert additional image data into the database
        await db.execute(
          `INSERT INTO post_images (post_id, image_big, image_default) VALUES (?, ?, ?)`,
          [postId, img_big, img_default]
        );
      });

      // Wait for all filePromises to complete
      await Promise.all(filePromises);
    }

    return NextResponse.json({
      message: "Files uploaded successfully",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
