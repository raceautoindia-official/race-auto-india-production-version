export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      "SELECT contact_text, contact_address, contact_email, contact_phone FROM settings WHERE id = 1"
    );

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = await req.json();

    await db.execute(
      "UPDATE settings SET contact_text = ?, contact_address = ?, contact_email = ?, contact_phone = ? WHERE id = 1",
      [
        payload.contact_text,
        payload.contact_address,
        payload.contact_email,
        payload.contact_phone,
      ]
    );

    return NextResponse.json({ message: "updated" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal error" }, { status: 500 });
  }
}
