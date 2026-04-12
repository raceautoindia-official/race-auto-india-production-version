import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessSeatLimit, isBusinessPlan, normalizePlanName } from "@/lib/subscriptionPlan";

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

// GET /api/business-members?ownerEmail=xxx
// Returns list of members for the authenticated owner.
export async function GET(req: NextRequest) {
  try {
    const owner = getOwnerFromRequest(req);
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ownerEmail = searchParams.get("ownerEmail");

    // Verify the requester is actually the owner being queried
    if (!ownerEmail || ownerEmail.toLowerCase().trim() !== owner.email.toLowerCase().trim()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [members]: any = await db.execute(
      `SELECT bm.id, bm.member_email, bm.member_user_id, bm.plan_name, bm.status, bm.created_at
       FROM business_members bm
       WHERE bm.owner_user_id = ? AND bm.status = 'active'
       ORDER BY bm.created_at ASC`,
      [owner.id]
    );

    // Also fetch owner's active subscription to return seat limit
    const [subRows]: any = await db.execute(
      `SELECT plan_name FROM subscriptions
       WHERE user_id = ? AND LOWER(status) = 'active' AND end_date >= NOW()
       LIMIT 1`,
      [owner.id]
    );

    const planName = subRows[0]?.plan_name ?? "";
    const seatLimit = getBusinessSeatLimit(planName);

    return NextResponse.json({ members, seatLimit, planName });
  } catch (err) {
    console.error("GET /api/business-members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/business-members
// Body: { memberEmail: string }
// Adds a member under the authenticated owner's business plan.
export async function POST(req: NextRequest) {
  try {
    const owner = getOwnerFromRequest(req);
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const memberEmail = String(body?.memberEmail ?? "").toLowerCase().trim();
    if (!memberEmail || !memberEmail.includes("@")) {
      return NextResponse.json({ error: "Valid member email is required" }, { status: 400 });
    }

    // Owner cannot add themselves
    if (memberEmail === owner.email.toLowerCase().trim()) {
      return NextResponse.json({ error: "You cannot add yourself as a member" }, { status: 400 });
    }

    // Verify owner has an active business (gold/platinum) subscription
    const [subRows]: any = await db.execute(
      `SELECT id, plan_name FROM subscriptions
       WHERE user_id = ? AND LOWER(status) = 'active' AND end_date >= NOW()
       LIMIT 1`,
      [owner.id]
    );

    if (!subRows[0]) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 403 });
    }

    const planName = normalizePlanName(subRows[0].plan_name);
    if (!isBusinessPlan(planName)) {
      return NextResponse.json(
        { error: "Only Business (gold/platinum) plan owners can add members" },
        { status: 403 }
      );
    }

    // Check seat limit
    const seatLimit = getBusinessSeatLimit(planName);
    const [countRows]: any = await db.execute(
      `SELECT COUNT(*) AS cnt FROM business_members
       WHERE owner_user_id = ? AND status = 'active'`,
      [owner.id]
    );
    const currentCount = Number(countRows[0]?.cnt ?? 0);
    if (currentCount >= seatLimit) {
      return NextResponse.json(
        { error: `Seat limit reached (${seatLimit} users max for ${planName} plan)` },
        { status: 409 }
      );
    }

    // Resolve member's user_id if they already have an account
    const [memberUserRows]: any = await db.execute(
      `SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [memberEmail]
    );
    const memberUserId = memberUserRows[0]?.id ?? null;

    // Upsert: if previously removed, re-activate; otherwise insert
    const [existing]: any = await db.execute(
      `SELECT id, status FROM business_members
       WHERE owner_user_id = ? AND LOWER(member_email) = ?`,
      [owner.id, memberEmail]
    );

    if (existing.length > 0) {
      if (existing[0].status === "active") {
        return NextResponse.json({ error: "Member already added" }, { status: 409 });
      }
      // Re-activate a previously removed entry
      await db.execute(
        `UPDATE business_members
         SET status = 'active', plan_name = ?, member_user_id = ?, updated_at = NOW()
         WHERE id = ?`,
        [planName, memberUserId, existing[0].id]
      );
    } else {
      await db.execute(
        `INSERT INTO business_members (owner_user_id, member_email, member_user_id, plan_name, status)
         VALUES (?, ?, ?, ?, 'active')`,
        [owner.id, memberEmail, memberUserId, planName]
      );
    }

    return NextResponse.json({ success: true, message: "Member added successfully" });
  } catch (err) {
    console.error("POST /api/business-members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
