import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// ✅ Replace this import based on your project DB helper
// Example: import db from "@/lib/db"; OR import pool from "@/utils/db";
import db from "@/lib/db";

type InteractionBody = {
  post_id: number;
  post_slug: string;
  interaction_type: string;
  visitor_id?: string | null;
  meta?: any;
};


function getClientIp(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || null;
}

function isBot(userAgent: string | null) {
  if (!userAgent) return false;
  const bots = [
    "bot",
    "crawler",
    "spider",
    "crawling",
    "facebookexternalhit",
    "whatsapp",
    "slurp",
    "bingpreview",
    "preview",
  ];

  
  const ua = userAgent.toLowerCase();
  return bots.some((b) => ua.includes(b));
}



function getUserFromAuth(req: NextRequest) {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) return null;

    const secret = process.env.JWT_KEY;
    if (!secret) return null;

    const decoded = jwt.verify(token, secret) as any;

    return {
      user_id: decoded?.id ?? decoded?.user_id ?? null,
      user_email: decoded?.email ?? null,
      user_role: decoded?.role ?? decoded?.user_role ?? null,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as InteractionBody;

    // ✅ basic validation
    if (!body?.post_id || !body?.post_slug || !body?.interaction_type) {
      return NextResponse.json(
        { ok: false, error: "Missing post_id/post_slug/interaction_type" },
        { status: 400 }
      );
    }

    const user = getUserFromAuth(req);
    const ip = getClientIp(req);
    const user_agent = req.headers.get("user-agent");
    const referer = req.headers.get("referer");

if (isBot(user_agent)) {
  return NextResponse.json({ ignored: "bot" });
}



    // 1) Raw insert
    await db.query(
  `
  INSERT INTO post_interactions
  (post_id, post_slug, interaction_type, visitor_id, user_id, user_email, user_role, ip, user_agent, referer, meta_json)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  [
    body.post_id,
    body.post_slug,
    body.interaction_type,
    body.visitor_id ?? null,
    user?.user_id ?? null,
    user?.user_email ?? null,
    user?.user_role ?? null,
    ip,
    user_agent,
    referer,
    body.meta ? JSON.stringify(body.meta) : null,
  ]
);


    // 2) Daily upsert
    await db.query(
      `
      INSERT INTO post_interaction_daily
      (post_id, post_slug, interaction_type, interaction_date, interaction_count)
      VALUES (?, ?, ?, CURDATE(), 1)
      ON DUPLICATE KEY UPDATE interaction_count = interaction_count + 1
      `,
      [body.post_id, body.post_slug, body.interaction_type]
    );

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const post_id = searchParams.get("post_id");
    const interaction_type = searchParams.get("interaction_type");
    const days = Number(searchParams.get("days") || "30");

    const where: string[] = [];
    const params: any[] = [];

    where.push(`interaction_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`);
    params.push(days);

    if (post_id) {
      where.push(`post_id = ?`);
      params.push(Number(post_id));
    }
    if (interaction_type) {
      where.push(`interaction_type = ?`);
      params.push(interaction_type);
    }

    const sql = `
      SELECT
        interaction_date,
        post_id,
        post_slug,
        interaction_type,
        interaction_count
      FROM post_interaction_daily
      WHERE ${where.join(" AND ")}
      ORDER BY interaction_date ASC
    `;

    const [rows] = await db.query(sql, params);
    return NextResponse.json({ ok: true, data: rows });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
