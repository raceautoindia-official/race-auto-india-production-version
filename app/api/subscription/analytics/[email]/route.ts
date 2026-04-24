import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

function getEffectiveStatus(status: any, endDate: any): "active" | "expired" | "free" {
  const statusValue = String(status || "").toLowerCase().trim();
  if (statusValue !== "active") return statusValue === "free" ? "free" : "expired";
  if (!endDate) return "expired";
  const expiryMs = new Date(endDate).getTime();
  if (!Number.isFinite(expiryMs) || expiryMs < Date.now()) return "expired";
  return "active";
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const email = decodeURIComponent(pathname.split("/").pop() || "");

    const [user]: any = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (!user[0]) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        {
          status: 404,
          headers: corsHeaders(req.headers.get("origin")),
        }
      );
    }

    const user_id = user[0].id;

    const [activeRows]: any = await db.execute(
      `SELECT *
       FROM subscriptions
       WHERE user_id = ? AND LOWER(status) = 'active' AND start_date <= NOW() AND end_date >= NOW()
       ORDER BY end_date DESC
       LIMIT 1`,
      [user_id]
    );

    if (activeRows.length > 0) {
      const row = activeRows[0];
      const effective_status = getEffectiveStatus(row.status, row.end_date);
      return NextResponse.json([{ ...row, effective_status }], {
        status: 200,
        headers: corsHeaders(req.headers.get("origin")),
      });
    }

    const [latestRows]: any = await db.execute(
      `SELECT *
       FROM subscriptions
       WHERE user_id = ?
       ORDER BY end_date DESC, id DESC
       LIMIT 1`,
      [user_id]
    );

    if (latestRows.length === 0) {
      return NextResponse.json(
        [
          {
            user_id,
            plan_name: "none",
            status: "free",
            effective_status: "free",
            created_at: null,
          },
        ],
        {
          status: 200,
          headers: corsHeaders(req.headers.get("origin")),
        }
      );
    }

    const latest = latestRows[0];
    const effective_status = getEffectiveStatus(latest.status, latest.end_date);
    return NextResponse.json(
      [{ ...latest, status: effective_status === "active" ? "active" : "expired", effective_status }],
      {
        status: 200,
        headers: corsHeaders(req.headers.get("origin")),
      }
    );
  } catch (err) {
    console.error("subscription analytics GET error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders(req.headers.get("origin")),
      }
    );
  }
}
