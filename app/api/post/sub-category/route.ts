import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const sub = searchParams.get("sub");
    const page: any = searchParams.get("page");

    const limit = 10; // Items per page
    const offset = (page - 1) * limit;

    const [row] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM categories WHERE name_slug = ?`,
      [sub],
    );

    if (row.length > 0) {
      const category_id = row[0].id;

      const [results] = await db.execute(
        `SELECT id, title, title_slug, summary, image_big, image_mid, created_at FROM posts WHERE category_id = ? ORDER BY created_at DESC LIMIT 10 OFFSET ${offset}`,
        [category_id],
      );

      const [totalCountResult] = await db.execute<RowDataPacket[]>(
        `SELECT COUNT(*) AS totalCount FROM posts WHERE category_id = ?`,
        [category_id],
      );

      const totalpost = totalCountResult[0].totalCount;

      return NextResponse.json({ results, totalpost });
    } else {
      return NextResponse.json({ message: "not found" }, { status: 404 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "internal error" }, { status: 500 });
  }
}
