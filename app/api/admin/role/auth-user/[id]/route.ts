export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest) {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();
  try {
    const [results] = await db.execute(`SELECT * FROM roles_permissions WHERE id = ?`,[id]);

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
