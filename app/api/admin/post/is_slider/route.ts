export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // const [results]=await db.execute(`SELECT id, title, image_small, pageviews FROM posts WHERE ${postType} = 1`)
    const [joinedRow] = await db.execute<RowDataPacket[]>(
      `SELECT posts.id, posts.image_small, posts.title, posts.pageviews, posts.title_slug, posts.created_at, posts.user_id, posts.is_slider, posts.featured_order, posts.slider_order, posts.is_featured, posts.is_breaking, posts.is_recommended, posts.category_id, categories.name_slug AS name_slug, categories.parent_id AS parent_id, categories.color AS color, categories.name AS sub_category, users.username AS username 
        FROM posts
        INNER JOIN users ON posts.user_id = users.id
        INNER JOIN categories ON posts.category_id = categories.id
        WHERE is_slider = 1`
    );

    const [category] = await db.execute<RowDataPacket[]>(
      `SELECT parent_id, name, name_slug, id FROM categories WHERE parent_id = 0`
    );

    const results = joinedRow.map((item) => {
      const findParent = category.find((obj) => item.parent_id == obj.id);

      if (findParent) {
        return {
          ...item,
          main_category: findParent.name,
          main_category_slug: findParent.name_slug,
        };
      } else {
        return { ...item, main_category: null, main_category_slug: null };
      }
    });

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
