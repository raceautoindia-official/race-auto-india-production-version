// /app/api/pageviews/route.ts
export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

type PageViewPayload = {
  page_type: "home" | "magazine" | "subscription";
};

export async function POST(req: Request) {
  try {
    const body: PageViewPayload = await req.json();

    if (!body.page_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    await db.execute(
      `
      INSERT INTO page_views (page_type, view_date, view_count)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE view_count = view_count + 1
      `,
      [body.page_type, today]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
    try {
      const [rows]: any = await db.execute(`
        SELECT view_date, page_type, view_count
        FROM page_views
        WHERE view_date >= CURDATE() - INTERVAL 30 DAY
        ORDER BY view_date ASC
      `);
  
      return NextResponse.json(rows);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Failed to fetch page views" }, { status: 500 });
    }
  }