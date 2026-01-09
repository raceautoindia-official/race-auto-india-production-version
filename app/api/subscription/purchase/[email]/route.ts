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

    // Check if the user already has an active subscription
    const [existingSubscription]: any = await db.execute(
      "SELECT * FROM subscriptions WHERE user_id = ?",
      [user_id]
    );

    if (existingSubscription.length == 0) {
      return NextResponse.json({ err: "not found" }, { status: 404 });
    }
    return NextResponse.json(existingSubscription);
    
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}
