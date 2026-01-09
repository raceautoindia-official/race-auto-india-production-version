export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      `SELECT id, font_name, font_key, font_url, font_family FROM fonts`
    );
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal error" }, { status: 500 });
  }
}
