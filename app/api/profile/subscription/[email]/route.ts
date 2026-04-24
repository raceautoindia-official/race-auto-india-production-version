import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const email = pathname.split("/").pop();

    // Validate email
    if (!email) {
      return NextResponse.json({ err: "Email is required" }, { status: 400 });
    }

    // Fetch user by email
    const [results]: any = await db.execute(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (results.length === 0) {
      return NextResponse.json({ err: "No subscriber found" }, { status: 404 });
    }

    const user = results[0];

    // Prefer currently active paid plan; otherwise return most recent row as expired for UI context.
    const [activeRows]: any = await db.execute(
      `SELECT *
       FROM subscriptions
       WHERE user_id = ? AND LOWER(status) = 'active' AND start_date <= NOW() AND end_date >= NOW()
       ORDER BY end_date DESC
       LIMIT 1`,
      [user.id]
    );

    if (activeRows.length > 0) {
      return NextResponse.json([activeRows[0]]);
    }

    const [latestRows]: any = await db.execute(
      `SELECT *
       FROM subscriptions
       WHERE user_id = ?
       ORDER BY end_date DESC, id DESC
       LIMIT 1`,
      [user.id]
    );

    if (latestRows.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json([{ ...latestRows[0], status: "expired" }]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ err: "Internal server error" }, { status: 500 });
  }
}
