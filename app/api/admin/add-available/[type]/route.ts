import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const type = pathname.split("/").pop();
    const payload = await req.json();
    await db.execute(`UPDATE posts SET ${type} = 1 WHERE id = ?`, [payload.id]);
    return NextResponse.json("updation success");
  } catch (err) {
    console.log(err);
  }
}
