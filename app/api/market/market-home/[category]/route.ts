import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const category = pathname.split("/").pop();
    const [row]: any = await db.execute(
      `SELECT * FROM post_market WHERE title_slug = ?`,
      [category]
    );

    if (row.length == 0) {
      return NextResponse.json({ err: "market not found" }, { status: 404 });
    }
    const parent_id = row[0].id;

    const [results] = await db.execute(
      `SELECT id, title, title_slug, summary, image_default, image_big, image_mid, created_at FROM posts WHERE market = ? ORDER BY created_at DESC LIMIT 4`,
      [parent_id]
    );
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json(err, { status: 500 });
  }
}
