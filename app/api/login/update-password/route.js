import db from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(req) {
  try {
    const payload = await req.json();

    const { email, password } = payload;
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const [user] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);

    if (!Array.isArray(user) || user.length === 0) {
      return NextResponse.json({ message: "No user with that email address" }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(`UPDATE users SET password = ? WHERE email = ?`, [hashedPassword, email]);

    return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });

  } catch (err) {
    console.error("Error updating password:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
