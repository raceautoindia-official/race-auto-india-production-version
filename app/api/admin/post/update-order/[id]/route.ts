import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req:NextRequest){
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();
  const { order_values, postType } = await req.json();

  const values = order_values || 1;

  try {
    if (postType == "is_featured") {
      await db.execute(`UPDATE posts SET featured_order = ? WHERE id = ?`, [
        values,
        id,
      ]);
      return  NextResponse.json("update feature order");
    } else {
      await db.execute(`UPDATE posts SET slider_order = ? WHERE id = ?`, [
        values,
        id,
      ]);
      return NextResponse.json("update feature order");
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Internal server error" },{status:500});
  }
}