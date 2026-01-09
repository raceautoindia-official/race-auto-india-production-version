export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      "SELECT id, title, title_slug, summary, image_mid, image_default FROM posts ORDER BY id DESC LIMIT 10"
    );
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "internal err" }, { status: 500 });
  }
}
