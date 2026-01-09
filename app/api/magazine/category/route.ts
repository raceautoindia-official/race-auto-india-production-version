import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(`SELECT * FROM newsletter_category`);
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server err" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { title, color } = await req.json();
  const title_slug = title.split(" ").join("-");
  try {
    await db.execute(
      `INSERT INTO newsletter_category (title, title_slug, color) VALUES (?, ?, ?)`,
      [title, title_slug, color]
    );
    return NextResponse.json("category added");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}
