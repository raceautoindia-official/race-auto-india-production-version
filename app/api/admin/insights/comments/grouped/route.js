import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT ic.insight_id, i.title, COUNT(ic.id) as total_comments
      FROM insight_comments ic
      JOIN insights i ON ic.insight_id = i.id
      GROUP BY ic.insight_id
      ORDER BY ic.insight_id DESC
    `);

    return NextResponse.json({ success: true, groups: rows });
  } catch (error) {
    console.error("Group fetch error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
