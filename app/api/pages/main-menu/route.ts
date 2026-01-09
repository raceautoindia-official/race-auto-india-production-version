export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      `SELECT id, title, slug, visibility, location, parent_id, is_custom FROM pages`
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching data from reports:", err);
    NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
