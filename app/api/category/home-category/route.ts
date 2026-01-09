import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);

    const main = searchParams.get("main");

    if (!main) {
      return NextResponse.json(
        { message: "Missing query parameters" },
        { status: 400 },
      );
    }

    const [row] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM categories WHERE name_slug = ?`,
      [main],
    );

    if (row.length > 0) {
      const parent_id = row[0].id;

      const [subElement] = await db.execute<RowDataPacket[]>(
        `SELECT id FROM categories WHERE parent_id = ?`,
        [parent_id],
      );

      if (subElement.length > 0) {
        const placeholder = subElement.map(() => "?").join(",");
        const subId = subElement.map((item) => item.id);

        const [results] = await db.execute(
          `SELECT id, title, title_slug, summary, image_big, image_mid, created_at FROM posts WHERE category_id IN (${placeholder}) ORDER BY created_at DESC LIMIT 11`,
          subId,
        );

        return NextResponse.json(results);
      } else {
        return NextResponse.json([]);
      }
    } else {
      return NextResponse.json({ message: "not found" }, { status: 404 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "internal error" }, { status: 500 });
  }
}
