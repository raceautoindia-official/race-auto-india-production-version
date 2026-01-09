import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  try {
    const [results] = await db.execute(
      `SELECT * FROM subscription_plan WHERE id = ${id}`
    );
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json("internal server error");
  }
}

export async function PUT(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  const payload = await req.json();
  try {
    const query = [
      payload.plan,
      payload.platinum,
      payload.gold,
      payload.silver,
      payload.bronze,
      payload.description,
      id,
    ];
    await db.execute(
      `UPDATE subscription_plan SET plan = ?, platinum = ?, gold = ?, silver = ?, bronze = ?, description = ? WHERE id = ?`, query
    );
    return NextResponse.json("updated plan");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  try {
    await db.execute(`DELETE FROM subscription_plan WHERE id = ${id}`);
    return NextResponse.json("plan deleted!");
  } catch (err) {
    console.log(err);
    return NextResponse.json(err, { status: 500 });
  }
}
