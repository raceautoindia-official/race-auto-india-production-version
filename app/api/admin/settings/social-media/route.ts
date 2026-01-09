export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      "SELECT facebook_url, twitter_url, instagram_url, pinterest_url, linkedin_url, vk_url, telegram_url, youtube_url FROM settings WHERE id = 1"
    );

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = await req.json();

    await db.execute(
      "UPDATE settings SET facebook_url = ?, twitter_url = ?, instagram_url = ?, pinterest_url = ?, linkedin_url = ?, vk_url = ?, telegram_url = ?, youtube_url = ? WHERE id = 1",
      [
        payload.facebook_url,
        payload.twitter_url,
        payload.instagram_url,
        payload.pinterest_url,
        payload.linkedin_url,
        payload.vk_url,
        payload.telegram_url,
        payload.youtube_url,
      ]
    );

    return NextResponse.json({ message: "updated" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal error" }, { status: 500 });
  }
}
