export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      "SELECT id, title, image_url, title_slug, created_date, category, magazine_views FROM newsletter ORDER BY id DESC LIMIT 10"
    );
    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching data from reports:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

