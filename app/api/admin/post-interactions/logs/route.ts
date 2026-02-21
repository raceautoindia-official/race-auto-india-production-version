export const dynamic = "force-dynamic";

import db from "@/lib/db";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const interaction_type =
      searchParams.get("interaction_type") || "flash_reports_click";

    const from = searchParams.get("from"); // YYYY-MM-DD
    const to = searchParams.get("to"); // YYYY-MM-DD

    const post_id = searchParams.get("post_id");
    const post_slug = searchParams.get("post_slug");
    const visitor_id = searchParams.get("visitor_id");
    const user_email = searchParams.get("user_email");
    const logged_only = searchParams.get("logged_only");

    const page = clamp(Number(searchParams.get("page") || 1), 1, 999999);
    const pageSize = clamp(Number(searchParams.get("pageSize") || 25), 5, 200);
    const offset = (page - 1) * pageSize;

    const where: string[] = ["interaction_type = ?"];
    const params: any[] = [interaction_type];

    if (post_id) {
      where.push("post_id = ?");
      params.push(Number(post_id));
    }
    if (post_slug) {
      where.push("post_slug LIKE ?");
      params.push(`%${post_slug}%`);
    }
    if (visitor_id) {
      where.push("visitor_id = ?");
      params.push(visitor_id);
    }
    if (user_email) {
      where.push("user_email LIKE ?");
      params.push(`%${user_email}%`);
    }
    if (logged_only === "1") {
      where.push("user_email IS NOT NULL AND user_email <> ''");
    }
    if (from) {
      where.push("DATE(created_at) >= ?");
      params.push(from);
    }
    if (to) {
      where.push("DATE(created_at) <= ?");
      params.push(to);
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;

    const [countRows] = await db.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM post_interactions ${whereSql}`,
      params,
    );
    const total = Number(countRows?.[0]?.total || 0);

    // sanitize numbers (important for security)
    const safeLimit = Number(pageSize);
    const safeOffset = Number(offset);

    const [rows] = await db.execute<RowDataPacket[]>(
      `
  SELECT
    id, post_id, post_slug, interaction_type,
    visitor_id, user_email, ip, user_agent, referer,
    meta_json, created_at
  FROM post_interactions
  ${whereSql}
  ORDER BY created_at DESC
  LIMIT ${safeLimit} OFFSET ${safeOffset}
  `,
      params,
    );

    return NextResponse.json({
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      rows,
    });
  } catch (err) {
    console.error("GET /api/admin/post-interactions/logs error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
