import crypto from "crypto";
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

async function getActiveOwnerPlan(ownerId: number) {
  const [subRows]: any = await db.execute(
    `SELECT plan_name FROM subscriptions
     WHERE user_id = ? AND LOWER(status) = 'active' AND start_date <= NOW() AND end_date >= NOW()
     ORDER BY end_date DESC
     LIMIT 1`,
    [ownerId]
  );

  if (!subRows[0]) return null;

  const planName = normalizePlanName(subRows[0].plan_name);
  if (!isBusinessPlan(planName)) return null;

  return planName;
}

export async function GET(req: NextRequest) {
  try {
    const owner = getOwnerFromRequest(req);
    if (!owner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const ownerEmail = searchParams.get("ownerEmail");

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

    let pendingInvites: any[] = [];
    try {
      const [inviteRows]: any = await db.execute(
        `SELECT id, member_email, status, expires_at, last_sent_at, created_at
         FROM business_member_invites
         WHERE owner_user_id = ? AND status = 'pending' AND expires_at >= NOW()
         ORDER BY created_at DESC`,
        [owner.id]
      );
      pendingInvites = inviteRows;
    } catch (inviteErr: any) {
      if (inviteErr?.code !== "ER_NO_SUCH_TABLE") throw inviteErr;
    }

    const planName = (await getActiveOwnerPlan(owner.id)) ?? "";
    const seatLimit = getBusinessSeatLimit(planName);

    return NextResponse.json({ members, pendingInvites, seatLimit, planName });
  } catch (err) {
    console.error("GET /api/business-members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

    if (memberEmail === owner.email.toLowerCase().trim()) {
      return NextResponse.json({ error: "You cannot add yourself as a member" }, { status: 400 });
    }

    const planName = await getActiveOwnerPlan(owner.id);
    if (!planName) {
      return NextResponse.json(
        { error: "Your plan must be active to manage shared members." },
        { status: 403 }
      );
    }

    const [memberUserRows]: any = await db.execute(
      `SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [memberEmail]
    );
    const memberUserId = memberUserRows[0]?.id ?? null;

    if (!memberUserId) {
      return NextResponse.json(
        { error: "This email is not registered yet. Ask the user to sign up before adding them as a member." },
        { status: 400 }
      );
    }

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

    const [existingActive]: any = await db.execute(
      `SELECT id FROM business_members
       WHERE owner_user_id = ? AND LOWER(member_email) = ? AND status = 'active'
       LIMIT 1`,
      [owner.id, memberEmail]
    );
    if (existingActive[0]) {
      return NextResponse.json({ error: "Member already added" }, { status: 409 });
    }

    const [otherActiveRows]: any = await db.execute(
      `SELECT id
       FROM business_members
       WHERE LOWER(member_email) = ? AND status = 'active' AND owner_user_id <> ?
       LIMIT 1`,
      [memberEmail, owner.id]
    );
    if (otherActiveRows[0]) {
      return NextResponse.json(
        { error: "This user is already associated with another membership account." },
        { status: 409 }
      );
    }

    const [otherPendingRows]: any = await db.execute(
      `SELECT id
       FROM business_member_invites
       WHERE LOWER(member_email) = ? AND status = 'pending' AND owner_user_id <> ?
       ORDER BY id DESC
       LIMIT 1`,
      [memberEmail, owner.id]
    );

    if (otherPendingRows[0]) {
      return NextResponse.json(
        { error: "This user already has a pending membership request from another account." },
        { status: 409 }
      );
    }

    const [sameOwnerPendingRows]: any = await db.execute(
      `SELECT id
       FROM business_member_invites
       WHERE LOWER(member_email) = ? AND status = 'pending' AND owner_user_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [memberEmail, owner.id]
    );

    if (sameOwnerPendingRows[0]) {
      await db.execute(
        `UPDATE business_member_invites
         SET invited_user_id = ?, plan_name = ?, updated_at = NOW()
         WHERE id = ?`,
        [memberUserId, planName, sameOwnerPendingRows[0].id]
      );

      return NextResponse.json({
        success: true,
        message: "Membership request is already pending. Ask the member to log in and accept the membership from their profile.",
      });
    }

    const pendingRequestTokenHash = crypto.createHash("sha256")
      .update(`profile-approval:${owner.id}:${memberEmail}:${Date.now()}:${Math.random()}`)
      .digest("hex");

    await db.execute(
      `INSERT INTO business_member_invites
       (owner_user_id, invited_user_id, member_email, plan_name, token_hash, status, expires_at, last_sent_at)
       VALUES (?, ?, ?, ?, ?, 'pending', DATE_ADD(NOW(), INTERVAL 3650 DAY), NOW())`,
      [owner.id, memberUserId, memberEmail, planName, pendingRequestTokenHash]
    );

    return NextResponse.json({
      success: true,
      message: "Membership request created. Ask the member to log in and accept the membership from their profile.",
    });
  } catch (err: any) {
    if (err?.code === "ER_NO_SUCH_TABLE") {
      return NextResponse.json(
        { error: "Invite storage is not initialized. Please run migration 004_business_member_invites.sql." },
        { status: 500 }
      );
    }
    console.error("POST /api/business-members error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
