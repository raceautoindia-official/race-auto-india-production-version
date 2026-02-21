export const dynamic = "force-dynamic";

import db from "@/lib/db";
import { NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";

function csvEscape(v: any) {
  const s = v === null || v === undefined ? "" : String(v);
  // wrap in quotes if contains comma/quote/newline
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const interaction_type = searchParams.get("interaction_type") || "flash_reports_click";

    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const post_id = searchParams.get("post_id");
    const post_slug = searchParams.get("post_slug");
    const visitor_id = searchParams.get("visitor_id");
    const user_email = searchParams.get("user_email");
    const logged_only = searchParams.get("logged_only");

    const where: string[] = ["interaction_type = ?"];
    const params: any[] = [interaction_type];

    if (post_id) { where.push("post_id = ?"); params.push(Number(post_id)); }
    if (post_slug) { where.push("post_slug LIKE ?"); params.push(`%${post_slug}%`); }
    if (visitor_id) { where.push("visitor_id = ?"); params.push(visitor_id); }
    if (user_email) { where.push("user_email LIKE ?"); params.push(`%${user_email}%`); }
    if (logged_only === "1") { where.push("user_email IS NOT NULL AND user_email <> ''"); }
    if (from) { where.push("DATE(created_at) >= ?"); params.push(from); }
    if (to) { where.push("DATE(created_at) <= ?"); params.push(to); }

    const whereSql = `WHERE ${where.join(" AND ")}`;

    // Note: if you expect millions of rows, we can stream; for now keep practical limit
    const [rows] = await db.execute<RowDataPacket[]>(
      `
      SELECT
        id, created_at, post_id, post_slug, interaction_type,
        visitor_id, user_email, ip, user_agent, referer, meta_json
      FROM post_interactions
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT 50000
      `,
      params
    );

    const header = [
      "id",
      "created_at",
      "post_id",
      "post_slug",
      "interaction_type",
      "visitor_id",
      "user_email",
      "ip",
      "user_agent",
      "referer",
      "meta_json",
    ];

    const lines = [
      header.join(","),
      ...rows.map((r: any) =>
        header.map((k) => csvEscape(r[k])).join(",")
      ),
    ];

    const csv = lines.join("\n");

    const filename = `flash_reports_clicks_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/post-interactions/export error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
