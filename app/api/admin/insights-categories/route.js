import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const [categories] = await db.execute("SELECT id, name FROM insight_category ORDER BY name ASC");
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}