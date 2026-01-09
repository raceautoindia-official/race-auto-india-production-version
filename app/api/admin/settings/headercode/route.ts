export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      `SELECT custom_header_codes FROM general_settings WHERE id = 1`
    );
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = await req.json();
    await db.execute(
      `UPDATE general_settings SET custom_header_codes = ? WHERE id = 1`,
      [payload.headerCode]
    );

    return NextResponse.json({ message: "header updated successfully" });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "internal server err" },
      { status: 500 }
    );
  }
}
