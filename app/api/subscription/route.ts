export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(`SELECT * FROM subscription_plan`);

    return NextResponse.json(results);
  } catch (err) {}
}
