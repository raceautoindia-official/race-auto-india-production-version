import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const query = `
      SELECT id, name, name_slug, description, keywords, show_at_homepage, 
             show_on_menu, color, block_type, category_order 
      FROM categories 
      WHERE parent_id = 0
    `;

    const [results] = await db.execute(query);

    return NextResponse.json(results);
  } catch (err) {
    console.error("Database query failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, keywords, color, block_type } = await req.json();
    const name_slug = name.trim().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").toLowerCase().split(" ").join("-");
    const query = [name, name_slug, description, keywords, color, block_type];
    await db.execute(
      `INSERT INTO categories (name, name_slug, description, keywords, color, block_type) VALUES (?, ?, ?, ?, ?, ?)`,
      query
    );
    return NextResponse.json("main_category created");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}
