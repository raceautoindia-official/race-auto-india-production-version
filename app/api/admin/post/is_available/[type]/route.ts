import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const type = pathname.split("/").pop();
    // const [results]=await db.execute(`SELECT id, title, image_small, pageviews FROM posts WHERE ${postType} = 1`)
    const [joinedRow]: any = await db.execute(
      `SELECT posts.id, posts.image_small, posts.title, posts.pageviews, posts.title_slug, posts.created_at, posts.user_id, posts.is_slider, posts.featured_order, posts.slider_order, posts.is_featured, posts.is_breaking, posts.is_recommended, posts.category_id, categories.name_slug AS name_slug, categories.parent_id AS parent_id, categories.color AS color, categories.name AS sub_category, users.username AS username 
        FROM posts
        INNER JOIN users ON posts.user_id = users.id
        INNER JOIN categories ON posts.category_id = categories.id
        WHERE ${type} = 1`
    );

    const [category]: any = await db.execute(
      `SELECT parent_id, name, name_slug, id FROM categories WHERE parent_id = 0`
    );

    const results = joinedRow.map((item: any) => {
      const findParent = category.find((obj: any) => item.parent_id == obj.id);

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
