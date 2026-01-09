export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute("SELECT * FROM roles_permissions");

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
}
