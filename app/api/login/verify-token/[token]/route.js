import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { pathname } = new URL(req.url);
    const token = decodeURIComponent(pathname.split("/").pop() ?? "");

    if (!token) {
      return NextResponse.json({ err: "Token is missing" }, { status: 400 });
    }

    // 1. Verify JWT signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return NextResponse.json({ err: "Reset link has expired. Please request a new one." }, { status: 400 });
      }
      return NextResponse.json({ err: "Invalid or expired reset link." }, { status: 400 });
    }

    const email = String(decoded?.email ?? "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ err: "Invalid token payload." }, { status: 400 });
    }

    // 2. Check DB column — token must still be stored (not yet used or cleared)
    const [userRows] = await db.execute(
      `SELECT password_reset_token FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [email]
    );

    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ err: "Invalid reset link." }, { status: 400 });
    }

    const storedToken = userRows[0]?.password_reset_token;
    if (!storedToken || storedToken !== token) {
      // Token already used or was never issued from this flow
      return NextResponse.json({ err: "This reset link has already been used or is invalid." }, { status: 400 });
    }

    // Valid — return the email so the confirm page can use it for the update call
    return NextResponse.json({ valid: true, email });
  } catch (err) {
    console.error("verify-token error:", err);
    return NextResponse.json({ err: "Internal server error" }, { status: 500 });
  }
}
