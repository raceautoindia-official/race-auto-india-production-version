import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const market = searchParams.get("market");
    const page: any = searchParams.get("page");

    const limit = 10;
    const offset = (page - 1) * limit;

    const [row] = await db.execute<RowDataPacket[]>(
        `SELECT * FROM post_market WHERE title_slug = ?`,
        [market]
      );

      if (row.length == 0) {
        return NextResponse.json({err:"market not found"},{status:404});
      }
      const parent_id = row[0].id;

      const [results] = await db.execute(
        `SELECT id, title, title_slug, summary, image_big, image_mid, created_at FROM posts WHERE market = ? ORDER BY created_at DESC LIMIT 11 OFFSET ${offset}`,
        [parent_id]
      );

        const [totalCountResult] = await db.execute<RowDataPacket[]>(
          `SELECT COUNT(*) AS totalCount FROM posts WHERE market = ?`,
          [parent_id]
        );

        const totalpost = totalCountResult[0].totalCount;

        return NextResponse.json({ results, totalpost });
      
    
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
