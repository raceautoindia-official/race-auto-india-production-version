// app/api/admin/insights/comments/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/lib/s3Client";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const BUCKET = process.env.AWS_S3_BUCKET_NAME;

// GET comments (safe parse of single or JSON-array images)
export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const insight_id = searchParams.get("insight_id");
  const user_email = searchParams.get("user_email") || "";

  if (!insight_id) {
    return NextResponse.json({ error: "Missing insight_id" }, { status: 400 });
  }

  const [rows] = await db.execute(
    `
      SELECT
        ic.*,
        COUNT(cl.comment_id) AS like_count,
        MAX(cl.user_email = ?) AS liked_by_user
      FROM insight_comments ic
      LEFT JOIN comment_likes cl
        ON ic.id = cl.comment_id
      WHERE ic.insight_id = ?
      GROUP BY ic.id
      ORDER BY like_count DESC, ic.created_at ASC
    `,
    [user_email, insight_id]
  );

  const formatted = rows.map(r => {
    let images = [];
    if (r.image_url) {
      try {
        const parsed = JSON.parse(r.image_url);
        images = Array.isArray(parsed) ? parsed : [r.image_url];
      } catch {
        images = [r.image_url];
      }
    }
    return {
      id: r.id,
      insight_id: r.insight_id,
      user_email: r.user_email,
      comment: r.comment,
      images,
      parent_id: r.parent_id,
      created_at: r.created_at,
      like_count: r.like_count,
      liked_by_user: Boolean(r.liked_by_user),
    };
  });

  return NextResponse.json(formatted);
}

// POST: new comment or reply (multiple files under "images[]")
export async function POST(req) {
  try {
    const formData = await req.formData();
    const insight_id = formData.get("insight_id")?.toString();
    const user_email = formData.get("user_email")?.toString();
    const comment = formData.get("comment")?.toString();
    const parent_id = formData.get("parent_id")?.toString() || null;

    if (!insight_id || !user_email || !comment) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const files = formData.getAll("images[]");
    const uploadedKeys = [];

    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;
      const ext = path.extname(file.name);
      const key = `uploads/insights/comments/${uuidv4()}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        })
      );
      uploadedKeys.push(key);
    }

    const image_url = uploadedKeys.length
      ? JSON.stringify(uploadedKeys)
      : null;

    await db.execute(
      `INSERT INTO insight_comments
         (insight_id, user_email, comment, image_url, parent_id)
       VALUES (?, ?, ?, ?, ?)`,
      [insight_id, user_email, comment, image_url, parent_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST comment error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT: edit existing comment or reply, merge new files with existing
export async function PUT(req) {
  try {
    const formData = await req.formData();
    const id = formData.get("id")?.toString();
    const comment = formData.get("comment")?.toString();

    if (!id || !comment) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // fetch existing image_url
    const [[row]] = await db.execute(
      "SELECT image_url FROM insight_comments WHERE id = ?",
      [id]
    );
    let existing = [];
    if (row && row.image_url) {
      try {
        const parsed = JSON.parse(row.image_url);
        existing = Array.isArray(parsed) ? parsed : [row.image_url];
      } catch {
        existing = [row.image_url];
      }
    }

    // upload any new files
    const files = formData.getAll("images[]");
    const uploadedKeys = [];
    for (const file of files) {
      if (!(file instanceof File) || file.size === 0) continue;
      const ext = path.extname(file.name);
      const key = `uploads/insights/comments/${uuidv4()}${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
          ContentType: file.type,
        })
      );
      uploadedKeys.push(key);
    }

    // merge existing + new
    const allKeys = existing.concat(uploadedKeys);
    const image_url = allKeys.length ? JSON.stringify(allKeys) : null;

    // update record
    await db.execute(
      `UPDATE insight_comments
         SET comment = ?,
             image_url = ?
       WHERE id = ?`,
      [comment, image_url, id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT comment error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: remove a comment/reply (and its children)
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing comment ID" },
        { status: 400 }
      );
    }

    await db.execute(
      `DELETE FROM insight_comments
         WHERE id = ? OR parent_id = ?`,
      [id, id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE comment error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
