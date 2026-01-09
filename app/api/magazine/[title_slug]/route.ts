import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const title_slug = pathname.split("/").pop();

    const [rows] = await db.execute<RowDataPacket[]>(
      "SELECT * FROM newsletter WHERE title_slug = ?",
      [title_slug],
    );

    if (rows.length > 0) {
      return NextResponse.json(rows);
    } else {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
