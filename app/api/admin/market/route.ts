import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title, color, show_on_menu } = await req.json();
  const title_slug = title.trim().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").toLowerCase().split(" ").join("-");
  try {
    await db.execute(
      `INSERT INTO post_market (title, title_slug, color, show_on_menu) VALUES (?, ?, ?, ?)`,
      [title, title_slug, color, show_on_menu]
    );
    return NextResponse.json("category added");
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [results] = await db.execute(`SELECT * FROM post_market`);
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
