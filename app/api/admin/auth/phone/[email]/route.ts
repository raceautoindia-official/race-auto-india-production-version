import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const email = pathname.split("/").pop();
  try {
    const [results]: any = await db.execute(
      "SELECT phone_number, phone_status FROM users WHERE email = ?",
      [email]
    );

    if (results.length == 0) {
      return NextResponse.json({ err: "no user found" }, { status: 404 });
    }

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const email = pathname.split("/").pop();
  try {
    const { phone } = await req.json();

    await db.execute(
      `UPDATE users SET phone_status = ?, phone_number = ? WHERE email = ?`,
      [1, phone, email]
    );

    return NextResponse.json("updated status");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "Internal server error" }, { status: 500 });
  }
}
