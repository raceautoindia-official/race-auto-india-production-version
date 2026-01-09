import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET: Fetch comments by post_id
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const post_id = searchParams.get("post_id");

    if (!post_id) {
      return NextResponse.json({ error: "post_id is required" }, { status: 400 });
    }

    const [rows] = await db.execute(
      "SELECT * FROM posts_comments WHERE post_id = ? ORDER BY created_at DESC",
      [post_id]
    );

    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET comments error:", err);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// PUT: Edit a comment
export async function PUT(req) {
  try {
    const { id, comment } = await req.json();

    if (!id || !comment) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await db.execute(`UPDATE posts_comments SET comment = ? WHERE id = ?`, [comment, id]);

    return NextResponse.json({ success: true, message: "Comment updated" });
  } catch (error) {
    console.error("Update failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: Add new comment (without image upload)
export async function POST(req) {
  try {
    const body = await req.json();
    const post_id = body.post_id;
    const comment = body.comment?.toString().trim();
    const email = body.email?.toString().trim();

    if (!email || !comment || !post_id) {
      return NextResponse.json(
        { error: "Email, comment and post_id are required" },
        { status: 400 }
      );
    }

    await db.execute(
      "INSERT INTO posts_comments (post_id, email, comment) VALUES (?, ?, ?)",
      [post_id, email, comment]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST comment error:", err);
    return NextResponse.json({ error: "Failed to submit comment" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("id");
    const email = searchParams.get("email");

    if (!commentId || !email) {
      return NextResponse.json({ error: "Missing id or email" }, { status: 400 });
    }

    // Only delete comment if email matches
    const [rows] = await db.execute("SELECT * FROM posts_comments WHERE id = ?", [commentId]);

    if (rows.length === 0 || rows[0].email !== email) {
      return NextResponse.json({ error: "Unauthorized or not found" }, { status: 403 });
    }

    await db.execute("DELETE FROM posts_comments WHERE id = ?", [commentId]);

    return NextResponse.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    console.error("DELETE comment error:", err);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}