export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [result] = await db.execute(
      `SELECT logo, logo_footer, logo_email, favicon FROM general_settings WHERE id = 1`
    );
    return NextResponse.json(result);
  } catch (err) {
    console.log(err);
    return NextResponse.json("internal error", { status: 500 });
  }
}
