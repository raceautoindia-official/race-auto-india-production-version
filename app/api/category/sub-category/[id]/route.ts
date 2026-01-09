import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();
    const [results] = await db.execute(
      `SELECT * FROM categories WHERE id = ${id}`
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

    const {
      categoryName,
      description,
      keywords,
      show_on_menu,
      color,
      parent_id,
    } = await req.json();

    const name_slug = categoryName.split(" ").join("-");

    const query = [
      categoryName,
      name_slug,
      description,
      keywords,
      parent_id,
      show_on_menu,
      color,
      id,
    ];

    const [row] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM categories WHERE id=?`,
      [id]
    );
    if (row.length < 1) {
      return NextResponse.json({ message: "item not found" }, { status: 404 });
    }
    await db.execute(
      `UPDATE categories SET name = ?, name_slug = ?, description = ?, keywords = ?, parent_id = ?, show_on_menu = ?, color = ? WHERE id = ?`,
      query
    );

    return NextResponse.json({ message: "sub_menu edited" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();
    await db.execute("DELETE FROM categories WHERE id = ?", [id]);
    return NextResponse.json("deleted category");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}