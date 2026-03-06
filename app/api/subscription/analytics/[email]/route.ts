import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

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

    const [existingSubscription]: any = await db.execute(
      "SELECT * FROM subscriptions WHERE user_id = ?",
      [user_id]
    );

    if (existingSubscription.length === 0) {
      return NextResponse.json(
        [
          {
            user_id,
            plan_name: "silver",
            status: "Active",
            created_at: null,
          },
        ],
        {
          status: 200,
          headers: corsHeaders(req.headers.get("origin")),
        }
      );
    }

    return NextResponse.json(existingSubscription, {
      status: 200,
      headers: corsHeaders(req.headers.get("origin")),
    });
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