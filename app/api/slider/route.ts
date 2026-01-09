export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const connection = await db.getConnection();

    const [results] = await connection.execute(
      `SELECT id, title, title_slug, summary, image_default, image_big, image_mid, slider_order, created_at FROM posts WHERE is_slider = 1 ORDER BY id DESC LIMIT 6`,
    );

    connection.release();

    return NextResponse.json(results);
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
