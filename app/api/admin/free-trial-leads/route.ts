import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

function isAdmin(req: NextRequest) {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) return false;
    const secret = process.env.JWT_KEY;
    if (!secret) return false;

    const decoded = jwt.verify(token, secret) as any;
    const role = String(decoded?.role || "").toLowerCase();

    return ["admin", "moderator", "ad team"].includes(role);
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const review_status = searchParams.get("review_status");

    let sql = `
      SELECT
        id,
        user_id,
        full_name,
        email,
        phone,
        company_name,
        segment,
        message,
        review_status,
        created_at,
        updated_at
      FROM free_trial_leads
    `;
    const params: any[] = [];

    if (review_status) {
      sql += ` WHERE review_status = ? `;
      params.push(review_status);
    }

    sql += ` ORDER BY id DESC `;

    const [rows]: any = await db.query(sql, params);

    return NextResponse.json(rows, { status: 200 });
  } catch (err) {
    console.error("Error fetching free trial leads:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}