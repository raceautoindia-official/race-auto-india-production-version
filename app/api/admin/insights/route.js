// /app/api/insights/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db";
import s3Client from "@/lib/s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT 
        insights.id, 
        insights.title,
        insights.title_slug,
        insights.keywords,
        GROUP_CONCAT(DISTINCT insight_images.image_url) AS images,
        GROUP_CONCAT(DISTINCT insight_category_map.category_id) AS category_ids
      FROM insights
      LEFT JOIN insight_images ON insight_images.insight_id = insights.id
      LEFT JOIN insight_category_map ON insight_category_map.insight_id = insights.id
      GROUP BY insights.id
      ORDER BY insights.id DESC
    `);

    const insights = rows.map((row) => ({
      id: row.id,
      title: row.title,
      title_slug: row.title_slug,
      keywords: row.keywords,
      images: row.images ? row.images.split(",") : [],
      categories: row.category_ids ? row.category_ids.split(",").map(Number) : [],
    }));

    return NextResponse.json({ success: true, insights });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const formData = await req.formData();

    const title = formData.get("title");
    const title_slug = formData.get("title_slug");
    const keywords = formData.get("keywords");
    const content = formData.get("content");
    const quotes = formData.get("quotes");
    const notes = formData.get("notes");
    const chartsJson = formData.get("charts");
    const categoriesJson = formData.get("categories");
    const images = formData.getAll("images");

    if (!title || !title_slug || !content || !chartsJson) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const charts = JSON.parse(chartsJson);
    const categoryIds = JSON.parse(categoriesJson || "[]");

    const [insightResult] = await db.execute(
      `INSERT INTO insights (title, title_slug, keywords, content, quotes, notes) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, title_slug, keywords, content, quotes, notes]
    );
    const insightId = insightResult.insertId;

    // Save charts
    for (let i = 0; i < charts.length; i++) {
      const { type, data, heading } = charts[i];
      await db.execute(
        `INSERT INTO insight_charts (insight_id, chart_type, chart_index, heading, data) VALUES (?, ?, ?, ?, ?)`,
        [insightId, type, i, heading || null, JSON.stringify(data)]
      );
    }

    // Link categories
    for (const catId of categoryIds) {
      await db.execute(
        `INSERT INTO insight_category_map (insight_id, category_id) VALUES (?, ?)`,
        [insightId, catId]
      );
    }

    // Upload media
    for (const file of images) {
      if (file && typeof file === "object" && file.size > 0) {
        const fileExt = path.extname(file.name);
        const fileName = `${uuidv4()}${fileExt}`;
        const s3Key = `uploads/insights/${fileName}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        await s3Client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: buffer,
            ContentType: file.type,
          })
        );

        await db.execute(
          `INSERT INTO insight_images (insight_id, image_url) VALUES (?, ?)`,
          [insightId, s3Key]
        );
      }
    }

    return NextResponse.json({ success: true, insightId });
  } catch (error) {
    console.error("Insight POST error:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
