import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const email = pathname.split("/").pop();

    const [user]: any = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (!user[0] || user[0].length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
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
      return NextResponse.json([activeRows[0]]);
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
      return NextResponse.json({ err: "not found" }, { status: 404 });
    }

    return NextResponse.json([{ ...latestRows[0], status: "expired" }]);
    
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}
