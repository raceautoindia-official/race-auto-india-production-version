import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// PUT: Add or update or remove user reaction
export async function PUT(req) {
  const { post_id, user_email, reaction_type } = await req.json();

  if (!post_id || !user_email || !reaction_type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const [[existing]] = await db.execute(
    "SELECT * FROM post_reactions WHERE post_id = ? AND user_email = ?",
    [post_id, user_email]
  );

  if (existing) {
    if (existing.reaction_type === reaction_type) {
      await db.execute(
        "DELETE FROM post_reactions WHERE post_id = ? AND user_email = ?",
        [post_id, user_email]
      );
      return NextResponse.json({ message: "Reaction removed" });
    } else {
      await db.execute(
        "UPDATE post_reactions SET reaction_type = ? WHERE post_id = ? AND user_email = ?",
        [reaction_type, post_id, user_email]
      );
      return NextResponse.json({ message: "Reaction updated" });
    }
  } else {
    await db.execute(
      "INSERT INTO post_reactions (post_id, user_email, reaction_type) VALUES (?, ?, ?)",
      [post_id, user_email, reaction_type]
    );
    return NextResponse.json({ message: "Reaction added" });
  }
}

// GET: Count of all reactions for a post
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const post_id = searchParams.get("post_id");
  const user_email = searchParams.get("email");

  if (!post_id) {
    return NextResponse.json({ error: "Missing post_id" }, { status: 400 });
  }

  // If requesting a specific user's reaction
  if (user_email) {
    const [[userReaction]] = await db.execute(
      "SELECT reaction_type FROM post_reactions WHERE post_id = ? AND user_email = ?",
      [post_id, user_email]
    );

    return NextResponse.json(userReaction || {});
  }

  // Else return group count of all reactions
  const [reactions] = await db.execute(
    "SELECT reaction_type, COUNT(*) as count FROM post_reactions WHERE post_id = ? GROUP BY reaction_type",
    [post_id]
  );

  return NextResponse.json(reactions);
}
