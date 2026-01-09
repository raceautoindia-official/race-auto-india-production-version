export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      'SELECT id, username, email, role, created_at FROM users WHERE role <> "user"'
    );

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json("internal server error", { status: 500 });
  }
}
