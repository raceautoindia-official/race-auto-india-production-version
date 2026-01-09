import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const main = searchParams.get("main");

    const [row] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM categories WHERE name_slug = ?`,
      [main]
    );

    if (row.length > 0) {
      const parent_id = row[0].id;

      const [subElement] = await db.execute<RowDataPacket[]>(
        `SELECT id FROM categories WHERE parent_id = ?`,
        [parent_id]
      );

      if (subElement.length > 0) {
        const placeholder = subElement.map(() => "?").join(",");
        const subId = subElement.map((item) => item.id);



        const [totalCountResult] = await db.execute<RowDataPacket[]>(
          `SELECT COUNT(*) AS totalCount FROM subscriber_list WHERE category_id IN (${placeholder})`,
          subId
        );

        const totalpost = totalCountResult[0].totalCount;

        return NextResponse.json(totalpost);
      } else {
        return NextResponse.json([]);
      }
    } else {
      return NextResponse.json("Main category not found", { status: 404 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
