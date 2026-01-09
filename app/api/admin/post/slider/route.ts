export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(`SELECT * FROM slider WHERE id = 1`);

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
    const { slider_type } = await req.json();
    await db.execute(`UPDATE slider SET slider_type = ? WHERE id = 1`, [
      slider_type,
    ]);
    return NextResponse.json("updated slider data");
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
