export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function GET(req: NextRequest) {
  try {
    const [results] = await db.execute(`SELECT * FROM subscription_plan`);

    return NextResponse.json(results, {
      status: 200,
      headers: corsHeaders(req.headers.get("origin")),
    });
  } catch (err) {
    console.error("subscription GET error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders(req.headers.get("origin")),
      }
    );
  }
}