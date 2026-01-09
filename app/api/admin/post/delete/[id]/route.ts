import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  try {
    await db.execute("DELETE FROM posts WHERE id = ?", [id]);

    return NextResponse.json({ messgae: "post deleted success" });
  } catch (error) {
    console.error("Error deleting node:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
