export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      `SELECT id, title, slug, page_order, visibility, location, parent_id FROM pages`
    );
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "internal err" }, { status: 500 });
  }
}
