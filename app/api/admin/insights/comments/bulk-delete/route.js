import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const { insight_id } = await req.json();
    if (!insight_id) {
      return NextResponse.json({ success: false, error: "Missing insight_id" }, { status: 400 });
    }

    await db.execute(`DELETE FROM insight_comments WHERE insight_id = ?`, [insight_id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk delete error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
