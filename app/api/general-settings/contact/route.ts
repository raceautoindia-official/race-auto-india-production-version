export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      "SELECT contact_text, contact_address, contact_email, contact_phone FROM settings WHERE id = 1"
    );

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json("internal error", { status: 500 });
  }
}
