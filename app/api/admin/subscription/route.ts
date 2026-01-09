import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(`SELECT * FROM subscription_plan`);
    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const payload = await req.json();
  try {
    const query = [
      payload.plan,
      payload.platinum,
      payload.gold,
      payload.silver,
      payload.bronze,
    ];
    await db.execute(
      `INSERT INTO subscription_plan (plan, platinum, gold, silver, bronze) VALUES (?, ?, ?, ?, ?)`,
      query
    );
    return NextResponse.json("plan added success");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}
