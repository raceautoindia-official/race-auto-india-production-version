// app/api/admin/insights/comments/like/route.ts
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { comment_id, user_email } = await req.json();
  // check if already liked
  const [[existing]] = await db.execute(
    `SELECT 1 FROM comment_likes WHERE comment_id=? AND user_email=?`,
    [comment_id, user_email]
  );
  if (existing) {
    // unlike
    await db.execute(
      `DELETE FROM comment_likes WHERE comment_id=? AND user_email=?`,
      [comment_id, user_email]
    );
  } else {
    // like
    await db.execute(
      `INSERT INTO comment_likes (comment_id, user_email) VALUES (?,?)`,
      [comment_id, user_email]
    );
  }
  // return new count
  const [[{ cnt }]] = await db.execute(
    `SELECT COUNT(*) AS cnt FROM comment_likes WHERE comment_id=?`,
    [comment_id]
  );
  return NextResponse.json({ likes: cnt, liked: !existing });
}
