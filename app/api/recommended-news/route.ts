export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      `SELECT id, title, title_slug, summary, image_big, image_default, image_mid, image_small, featured_order, created_at FROM posts WHERE is_recommended = 1`
    );
    return NextResponse.json(results);
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
