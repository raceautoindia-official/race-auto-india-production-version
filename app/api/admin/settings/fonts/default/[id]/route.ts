import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();

    await db.execute(`UPDATE fonts SET is_default = 0 WHERE is_default = 1`);

    await db.execute(`UPDATE fonts SET is_default = 1 WHERE id = ${id}`);

    return NextResponse.json("updated font");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal error" }, { status: 500 });
  }
}
