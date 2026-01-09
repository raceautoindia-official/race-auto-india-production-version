import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  try {
    const [results] = await db.execute(`SELECT * FROM pages WHERE id = ?`, [
      id,
    ]);
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  const {
    title,
    description,
    keywords,
    parent_id,
    location,
    visibility,
    page_content,
  } = await req.json();

  try {
    await db.execute(
      `UPDATE pages SET title = ?, description = ?, keywords = ?, parent_id = ?, location = ?, visibility = ?, page_content = ? WHERE id = ?`,
      [
        title,
        description,
        keywords,
        parent_id,
        location,
        visibility,
        page_content,
        id,
      ]
    );
    return NextResponse.json("updated");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}
