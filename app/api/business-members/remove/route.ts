import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

function getOwnerFromRequest(req: NextRequest): { id: number; email: string } | null {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) return null;
    const secret = process.env.JWT_KEY;
    if (!secret) return null;
    const decoded = jwt.verify(token, secret) as any;
    if (!decoded?.id || !decoded?.email) return null;
    return { id: Number(decoded.id), email: String(decoded.email) };
  } catch {
    return null;
  }
}

// POST /api/business-members/remove
// Body: { memberEmail: string }
// Soft-removes a member from the owner's business plan.
// Immediate revocation: the effective subscription check will no longer find an active membership.
export async function POST(req: NextRequest) {
  try {
    const owner = getOwnerFromRequest(req);
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const memberEmail = String(body?.memberEmail ?? "").toLowerCase().trim();
    if (!memberEmail) {
      return NextResponse.json({ error: "memberEmail is required" }, { status: 400 });
    }

    // Verify this member belongs to this owner
    const [rows]: any = await db.execute(
      `SELECT id FROM business_members
       WHERE owner_user_id = ? AND LOWER(member_email) = ? AND status = 'active'`,
      [owner.id, memberEmail]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: "Active member not found under your account" }, { status: 404 });
    }

    // Soft-delete: set status = 'removed' — immediate revocation
    await db.execute(
      `UPDATE business_members SET status = 'removed', updated_at = NOW() WHERE id = ?`,
      [rows[0].id]
    );

    return NextResponse.json({ success: true, message: "Member removed successfully" });
  } catch (err) {
    console.error("POST /api/business-members/remove error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
