export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(`SELECT ad_space FROM ad_spaces`);
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "internal error" }, { status: 500 });
  }
}
