export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const [result] = await db.execute(
      "SELECT primary_font, secondary_font, tertiary_font from settings WHERE id = 1"
    );

    return NextResponse.json(result);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const payload = await req.json();

  try {
    await db.execute(
      `UPDATE settings SET primary_font = ?, secondary_font = ?, tertiary_font = ? WHERE id = 1`,
      [payload.primary_font, payload.secondary_font, payload.tertiary_font]
    );

    return NextResponse.json("font updated!");
  } catch (err) {
    console.log(err);

    return NextResponse.json({ err: "internal error" }, { status: 500 });
  }
}
