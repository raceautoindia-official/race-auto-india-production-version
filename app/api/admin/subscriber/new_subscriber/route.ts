import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const [existingEmail]: any = await db.execute(
      `SELECT * FROM subscribers WHERE email = ?`,
      [payload.email]
    );
    if (existingEmail.length !== 0) {
      return NextResponse.json({
        message: "User with this email already exists",
      });
    }
    await db.execute(
      `INSERT INTO subscribers (name, email, phone_number) VALUES (?, ?, ?)`,
      [payload.name, payload.email, payload.phoneNumber]
    );
    return NextResponse.json({ message: "subscriber added" });
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
