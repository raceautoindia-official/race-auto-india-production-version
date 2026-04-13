import db from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(req) {
  try {
    const payload = await req.json();
    const { email, password, token } = payload;

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [user] = await db.execute(
      `SELECT id, password_reset_token FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [normalizedEmail]
    );

    if (!Array.isArray(user) || user.length === 0) {
      return NextResponse.json({ message: "No user with that email address" }, { status: 404 });
    }

    // If a token was passed, verify it matches the stored one before updating
    // (token field is optional for backward compatibility with direct admin calls)
    if (token !== undefined) {
      const storedToken = user[0]?.password_reset_token;
      if (!storedToken || storedToken !== token) {
        return NextResponse.json({ message: "Invalid or already used reset link." }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear the reset token in one query to invalidate the link
    await db.execute(
      `UPDATE users SET password = ?, password_reset_token = NULL WHERE LOWER(email) = ?`,
      [hashedPassword, normalizedEmail]
    );

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
  } catch (err) {
    console.error("update-password error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
