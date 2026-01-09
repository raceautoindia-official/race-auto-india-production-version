import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const category = searchParams.get("category");
    const page: any = searchParams.get("page");

    const limit = 10;
    const offset = (page - 1) * limit;

    const [tags] = await db.execute<RowDataPacket[]>(
      `SELECT post_id FROM tags WHERE tag_slug = ?`,
      [category]
    );

    if (tags.length == 0) {
      return NextResponse.json({ err: "tag not found" }, { status: 404 });
    }

    const placeholders = tags.map(() => "?").join(", ");
    const tagIds = tags.map((tag) => tag.post_id);

    const [results] = await db.execute(
      `SELECT id, title, title_slug, image_big, summary, image_description, created_at 
       FROM posts 
       WHERE id IN (${placeholders}) ORDER BY created_at DESC LIMIT 10 OFFSET ${offset}`,
      tagIds
    );

    const [totalCountResult] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS totalCount FROM posts WHERE id IN (${placeholders})`,
      tagIds
    );

    const totalpost = totalCountResult[0].totalCount;

    return NextResponse.json({ results, totalpost });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
