import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const page: any = searchParams.get("page");

    const limit = 10; // Items per page
    const offset = (page - 1) * limit;
    const title = pathname.split("/").pop();
    const searchItem = title?.split("-").join(" ");
    const [results] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM posts WHERE LOWER(content) LIKE LOWER('%${searchItem}%') OR LOWER(title) LIKE LOWER('%${searchItem}%') ORDER BY id DESC LIMIT 10 OFFSET ${offset}`,
    );
    const [total] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM posts WHERE LOWER(content) LIKE LOWER('%${searchItem}%') OR LOWER(title) LIKE LOWER('%${searchItem}%') ORDER BY id DESC`,
    );

    if (results.length === 0) {
      return NextResponse.json("Data not found", { status: 404 });
    }
    return NextResponse.json({ results, totalpages: total.length });
  } catch (err) {
    console.log(err);
    return NextResponse.json("Internal server error", { status: 500 });
  }
}
