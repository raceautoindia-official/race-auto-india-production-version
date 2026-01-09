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

    // Fetch subscriptions using user_id
    const [subscriptionRows]: any = await db.execute(
      "SELECT * FROM subscriptions WHERE user_id = ?",
      [user.id]  // Access the first result's id
    );

    return NextResponse.json(subscriptionRows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ err: "Internal server error" }, { status: 500 });
  }
}
