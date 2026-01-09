import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();

    const [results] = await db.execute(
      `SELECT * FROM categories WHERE parent_id = ?`,
      [id],
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error("Database query failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
