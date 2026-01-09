import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const title_slug = pathname.split("/").pop();

    const results: any = await db.execute(
      `UPDATE newsletter SET magazine_views = magazine_views + 1 WHERE title_slug = ?`,
      [title_slug]
    );

    if (results.affectedRows === 0) {
      return NextResponse.json({ message: "magazine not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "View count incremented successfully",
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Internal server error" });
  }
}
