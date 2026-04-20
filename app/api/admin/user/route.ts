export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      "SELECT id, username, email, role, created_at, phone_number, subscription FROM users"
    );

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const ids = Array.isArray(body?.ids)
      ? body.ids
          .map((id: unknown) => Number(id))
          .filter((id: number) => Number.isInteger(id) && id > 0)
      : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { err: "A non-empty ids array is required" },
        { status: 400 }
      );
    }

    const placeholders = ids.map(() => "?").join(", ");
    await db.execute(`DELETE FROM users WHERE id IN (${placeholders})`, ids);

    return NextResponse.json({
      message: "users deleted successfully",
      deletedCount: ids.length,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}

