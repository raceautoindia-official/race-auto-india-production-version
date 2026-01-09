import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { image_url } = await req.json();

    const [isAdditional]: any = await db.execute(
      "SELECT * FROM post_images WHERE image_big = ?",
      [image_url]
    );

    if (isAdditional.length >= 1) {
      await db.execute("DELETE FROM post_images WHERE image_big = ?", [
        image_url,
      ]);
      return NextResponse.json({
        message: "Additional image removed successfully",
      });
    }

    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
