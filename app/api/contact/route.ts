import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      "SELECT contact_text, contact_address, contact_email, contact_phone FROM settings WHERE id = 1"
    );

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    await db.execute(
      `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`,
      [name, email, message]
    );
    return NextResponse.json("message added");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server err" }, { status: 500 });
  }
}
