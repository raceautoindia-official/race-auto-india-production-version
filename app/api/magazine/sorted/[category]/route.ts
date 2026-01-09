import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const category = pathname.split("/").pop();
    if (category == "0") {
      const [result] = await db.execute(
        "SELECT title, image_url, title_slug, created_date, category, magazine_views FROM newsletter ORDER BY id DESC"
      );
      return NextResponse.json(result);
    }

    const [results] = await db.execute(
      `SELECT title, image_url, title_slug, created_date, category, magazine_views FROM newsletter WHERE category = ? ORDER BY id DESC`,
      [category]
    );
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}
