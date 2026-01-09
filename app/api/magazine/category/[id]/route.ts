import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();
    const [results] = await db.execute(
      `SELECT * FROM newsletter_category WHERE id = ?`,
      [id]
    );
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();
    const { title, color } = await req.json();

    const title_slug = title
      .trim()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .split(" ")
      .join("-");

    await db.execute(
      `UPDATE newsletter_category SET title = ?, title_slug = ?, color = ? WHERE id = ?`,
      [title, title_slug, color, id]
    );
    return NextResponse.json("updated success");
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
