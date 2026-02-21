export const dynamic = "force-dynamic";

import db from "@/lib/db";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const from = searchParams.get("from"); // YYYY-MM-DD
    const to = searchParams.get("to");     // YYYY-MM-DD
    const post_id = searchParams.get("post_id");
    const interaction_type = searchParams.get("interaction_type") || "flash_reports_click";

    const where: string[] = ["interaction_type = ?"];
    const params: any[] = [interaction_type];

    if (post_id) {
      where.push("post_id = ?");
      params.push(Number(post_id));
    }
    if (from) {
      where.push("DATE(created_at) >= ?");
      params.push(from);
    }
    if (to) {
      where.push("DATE(created_at) <= ?");
      params.push(to);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [totals] = await db.execute<RowDataPacket[]>(
      `
      SELECT
        COUNT(*) AS total_clicks,
        COUNT(DISTINCT visitor_id) AS unique_visitors,
        SUM(CASE WHEN user_email IS NOT NULL AND user_email <> '' THEN 1 ELSE 0 END) AS logged_clicks,
        SUM(CASE WHEN user_email IS NULL OR user_email = '' THEN 1 ELSE 0 END) AS anon_clicks
      FROM post_interactions
      ${whereSql}
      `,
      params
    );

    const [topPosts] = await db.execute<RowDataPacket[]>(
      `
      SELECT post_id, post_slug,
             COUNT(*) AS clicks,
             COUNT(DISTINCT visitor_id) AS uniques
      FROM post_interactions
      ${whereSql}
      GROUP BY post_id, post_slug
      ORDER BY clicks DESC
      LIMIT 20
      `,
      params
    );

    const [daily] = await db.execute<RowDataPacket[]>(
      `
      SELECT DATE(created_at) AS day,
             COUNT(*) AS clicks,
             COUNT(DISTINCT visitor_id) AS uniques
      FROM post_interactions
      ${whereSql}
      GROUP BY DATE(created_at)
      ORDER BY day ASC
      `,
      params
    );

    const [referrers] = await db.execute<RowDataPacket[]>(
  `
  SELECT referer, COUNT(*) as clicks
  FROM post_interactions
  WHERE interaction_type = ?
  GROUP BY referer
  ORDER BY clicks DESC
  LIMIT 10
  `,
  [interaction_type]
);

const [devices] = await db.execute<RowDataPacket[]>(
  `
  SELECT
    CASE
      WHEN user_agent LIKE '%Mobile%' THEN 'Mobile'
      WHEN user_agent LIKE '%Tablet%' THEN 'Tablet'
      ELSE 'Desktop'
    END as device,
    COUNT(*) as clicks
  FROM post_interactions
  WHERE interaction_type = ?
  GROUP BY device
  `,
  [interaction_type]
);

    return NextResponse.json({
      totals: totals?.[0] || { total_clicks: 0, unique_visitors: 0, logged_clicks: 0, anon_clicks: 0 },
  topPosts,
  daily,
  referrers,
  devices
    });
  } catch (err) {
    console.error("GET summary error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
