export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      "SELECT facebook_url, twitter_url, instagram_url, pinterest_url, linkedin_url, vk_url, telegram_url, youtube_url FROM settings WHERE id = 1"
    );
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json("internal error", { status: 500 });
  }
}
