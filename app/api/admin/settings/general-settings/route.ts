export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const [result] = await db.execute(
      "SELECT application_name, optional_url_button_name, about_footer, copyright FROM settings WHERE id = 1"
    );

    return NextResponse.json(result);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = await req.json();

    await db.execute(
      "UPDATE settings SET application_name = ?, optional_url_button_name = ?, about_footer = ?, copyright = ? WHERE id = 1",
      [
        payload.application_name,
        payload.optional_url_button_name,
        payload.about_footer,
        payload.copyright,
      ]
    );

    return NextResponse.json({ message: "updated" });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal error" }, { status: 500 });
  }
}
