// /app/api/designs/route.js
import db from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

// GET - Retrieve all email designs
export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM email_designs ORDER BY updated_at DESC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/designs error:", error);
    return NextResponse.error();
  }
}

// POST - Create a new email design
export async function POST(req) {
  try {
    const payload = await req.json();
    const { name, design_json, html } = payload;

    const [result] = await db.query(
      "INSERT INTO email_designs (name, design_json, html) VALUES (?, ?, ?)",
      [name, design_json, html]
    );

    return NextResponse.json({ id: result.insertId });
  } catch (error) {
    console.error("POST /api/designs error:", error);
    return NextResponse.error();
  }
}
