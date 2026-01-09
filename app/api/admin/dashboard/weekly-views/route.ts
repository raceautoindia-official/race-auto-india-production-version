export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS post_date, SUM(pageviews) AS total_pageviews 
       FROM posts 
       WHERE created_at >= CURDATE() - INTERVAL 30 DAY 
       GROUP BY post_date 
       ORDER BY post_date ASC`
    );

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json(err, { status: 500 });
  }
}
