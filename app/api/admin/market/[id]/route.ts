import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  try {
    const [results] = await db.execute(
      `SELECT * FROM post_market WHERE id = ?`,
      [id]
    );
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  const { title, color, show_on_menu } = await req.json();
  const title_slug = title.split(" ").join("-");
  try {
    await db.execute(
      `UPDATE post_market SET title = ?, title_slug = ?, color = ?, show_on_menu = ? WHERE id = ?`,
      [title, title_slug, color, show_on_menu, id]
    );
    return NextResponse.json("updated success");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "internal server error" });
  }
}

export async function DELETE(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  try {
    await db.execute("DELETE FROM post_market WHERE id = ?", [id]);

    return NextResponse.json({ message: "post deleted successfully" });
  } catch (error) {
    console.error("Error deleting node:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
