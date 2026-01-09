// /app/api/designs/[id]/route.js
import db from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

// GET - Retrieve a specific design by id
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const [rows] = await db.query(
      "SELECT * FROM email_designs WHERE id = ?",
      [id]
    );
    return NextResponse.json(rows[0] || {});
  } catch (error) {
    console.error(`GET /api/designs/${params.id} error:`, error);
    return NextResponse.error();
  }
}

// PUT - Update an existing design by id
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const payload = await req.json();
    const { name, design_json, html } = payload;

    await db.execute(
      "UPDATE email_designs SET name = ?, design_json = ?, html = ? WHERE id = ?",
      [name, design_json, html, id]
    );
    return NextResponse.json({ message: "Update successful" });
  } catch (error) {
    console.error(`PUT /api/designs/${params.id} error:`, error);
    return NextResponse.error();
  }
}

// DELETE - Delete a design by id
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await db.execute("DELETE FROM email_designs WHERE id = ?", [id]);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(`DELETE /api/designs/${params.id} error:`, error);
    return NextResponse.error();
  }
}
