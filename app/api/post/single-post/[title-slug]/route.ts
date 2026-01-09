import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const title_slug = pathname.split("/").pop();

    const [results] = await db.execute<RowDataPacket[]>(
      `SELECT id, title, image_big, image_default, image_mid, pageviews, summary, is_recommended, image_description, keywords, content, category_id, created_at FROM posts WHERE title_slug = ?`,
      [title_slug]
    );

    if (results.length > 0) {
      const postId = results[0].id;

      const [tags] = await db.execute(`SELECT * FROM tags WHERE post_id = ?`, [
        postId,
      ]);

      const [additionalImages] = await db.execute<RowDataPacket[]>(
        `SELECT image_default FROM post_images WHERE post_id = ?`,
        [postId]
      );
      const [sub_category]: any = await db.execute(
        `SELECT * FROM categories WHERE id = ?`,
        [results[0].category_id]
      );

      const [main_category]: any = await db.execute(
        `SELECT * FROM categories WHERE id = ?`,
        [sub_category[0].parent_id]
      );

      const images = [
        { image_default: results[0].image_default },
        ...additionalImages,
      ];

      const result = results.map((item) => {
        return {
          ...item,
          tag: tags,
          images,
          main_category: main_category[0].name,
          sub_category: sub_category[0].name,
          main_category_color: main_category[0].color,
          sub_category_color: sub_category[0].color,
        };
      });
      return NextResponse.json(result);
    } else {
      return NextResponse.json("data not found", { status: 404 });
    }
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
