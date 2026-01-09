import db from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import schedule from "node-schedule";
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

    const [joinedRow] = await db.execute(
      `SELECT posts.id, posts.image_mid, posts.summary, posts.title, posts.content, posts.market, posts.keywords, posts.pageviews, posts.user_id, posts.image_description, posts.status, posts.is_slider, posts.is_featured, posts.is_breaking, posts.is_recommended, posts.category_id, posts.is_scheduled, posts.created_at, categories.name_slug AS name_slug, categories.parent_id AS parent_id, categories.color AS color, categories.name AS sub_category, users.username AS username 
      FROM posts
      INNER JOIN users ON posts.user_id = users.id
      INNER JOIN categories ON posts.category_id = categories.id
      WHERE posts.id = ${id}`
    );

    const [category] = await db.execute(
      `SELECT parent_id, name, name_slug, id FROM categories WHERE parent_id = 0`
    );
    const [tags] = await db.execute(`SELECT * FROM tags WHERE post_id = ?`, [
      id,
    ]);

    const [additionalImages] = await db.execute(
      `SELECT image_big as image_mid FROM post_images WHERE post_id = ?`,
      [id]
    );

    const results = joinedRow.map((item) => {
      const findParent = category.find((obj) => item.parent_id == obj.id);

      if (findParent) {
        return {
          ...item,
          main_category: findParent.name,
          main_category_slug: findParent.name_slug,
          tag: tags,
          imageDefault: joinedRow[0].image_mid,
          additionalImages: additionalImages,
        };
      } else {
        return {
          ...item,
          main_category: "",
          main_category_slug: "",
          tag: tags,
          imageDefault: joinedRow[0].image_mid,
          additionalImages: additionalImages,
        };
      }
    });
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internel server err" }, { status: 500 });
  }
}

export async function PUT(req) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  try {
    const formData = await req.formData();
    const title = formData.get("title");
    const content = formData.get("content");
    const summary = formData.get("summary");
    const category_id = formData.get("category_id");
    const keywords = formData.get("keywords");
    const tags = formData.get("tags");
    const is_slider = formData.get("is_slider");
    const is_featured = formData.get("is_featured");
    const is_recommended = formData.get("is_recommended");
    const is_breaking = formData.get("is_breaking");
    const image_description = formData.get("image_description");
    const market = formData.get("market");
    const draftValue = formData.get("draft");
    const image_default = formData.get("image_default");
    const additional_image = formData.get("additional_image");
    const draft = draftValue == "true" ? 0 : 1;
    const tags_split = tags.split(",");
    const updateDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const scheduled = formData.get("schedule_time");
    const scheduleTime =
      scheduled === null || scheduled === "" || scheduled === undefined
        ? 0
        : new Date(scheduled) < new Date()
        ? 0
        : 1;
    let queryParams = [
      title,
      content,
      summary,
      image_description,
      is_breaking,
      is_featured,
      is_slider,
      is_recommended,
      keywords,
      category_id,
      market,
      draft,
      updateDate,
      scheduleTime,
    ];

    let queryStr = `
      UPDATE posts SET
        title = ?,
        content = ?,
        summary = ?,
        image_description = ?,
        is_breaking = ?,
        is_featured = ?,
        is_slider = ?,
        is_recommended = ?,
        keywords = ?,
        category_id = ?,
        market = ?,
        status = ?,
        updated_at = ?,
        is_scheduled = ?
      WHERE id = ?
    `;

    const files = [];

    for (const [key, value] of formData.entries()) {
      if (key === "additional_image" && value instanceof Blob) {
        files.push(value);
      }
    }
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
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

    if (image_default) {
      const firstFilename = image_default.name;
      const imageFileExtension = firstFilename.split(".").pop();
      const newImageName = `${uuidv4()}.${imageFileExtension}`;

      const folderPath = `uploads/images/${folderName}`;

      // Read the first file into a buffer
      const firstFileBuffer = Buffer.from(await image_default.arrayBuffer());

      // Define the S3 upload function

      // Upload original image
      const originalKey = `${folderPath}/${newImageName}`;
      await uploadToS3(firstFileBuffer, originalKey, image_default.type);

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

      queryStr = `
      UPDATE posts SET
        title = ?,
        content = ?,
        summary = ?,
        image_description = ?,
        is_breaking = ?,
        is_featured = ?,
        is_slider = ?,
        is_recommended = ?,
        image_default = ?,
        image_big = ?,
        image_small = ?,
        image_mid = ?,
        keywords = ?,
        category_id = ?,
        market = ?,
        status = ?,
        updated_at = ?,
        is_scheduled = ?
      WHERE id = ?
    `;

      queryParams = [
        title,
        content,
        summary,
        image_description,
        is_breaking,
        is_featured,
        is_slider,
        is_recommended,
        img_default,
        img_big,
        img_small,
        img_mid,
        keywords,
        category_id,
        market,
        draft,
        updateDate,
        scheduleTime,
        id,
      ];
    } else {
      queryParams.push(id);
    }

    if (additional_image) {
      const folderPath = `uploads/images/${folderName}`;
      const filePromises = files.map(async (file) => {
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
          [id, img_big, img_default]
        );
      });

      // Wait for all filePromises to complete
      await Promise.all(filePromises);
    }
    if (scheduled) {
      const publishTime = new Date(scheduled);
      const currentTime = new Date();
      const updateCreated_at = new Date()
        .toISOString()
        .replace("T", " ")
        .split(".")[0];

      // Check if the scheduled time is in the past
      if (publishTime < currentTime) {
        await db.execute(`UPDATE posts SET created_at = ? WHERE id = ?`, [
          publishTime,
          id,
        ]);
        console.log("Scheduled time is in the past. No action taken.");
      } else {
        schedule.scheduleJob(publishTime, async function () {
          await db.execute(
            `UPDATE posts SET is_scheduled = 0, created_at = ? WHERE id = ?`,
            [updateCreated_at, id]
          );
          console.log(`Post with ID ${id} is now published.`);
        });
      }
    }

    await db.execute(queryStr, queryParams);
    await db.execute("DELETE FROM tags WHERE post_id = ?", [id]);
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
        [id, item, tag_slug]
      );
    }

    return NextResponse.json("updated");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server err" }, { status: 500 });
  }
}
