import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { getBusinessSeatLimit, isBusinessPlan, normalizePlanName } from "@/lib/subscriptionPlan";

function getUserFromRequest(req: NextRequest): { id: number; email: string } | null {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) return null;
    const secret = process.env.JWT_KEY;
    if (!secret) return null;
    const decoded = jwt.verify(token, secret) as any;
    if (!decoded?.id || !decoded?.email) return null;
    return { id: Number(decoded.id), email: String(decoded.email).toLowerCase().trim() };
  } catch {
    return null;
  }
}

async function getPendingInviteForUser(email: string) {
  const [inviteRows]: any = await db.execute(
    `SELECT bi.id, bi.owner_user_id, bi.invited_user_id, bi.member_email, bi.plan_name, bi.status,
            bi.created_at, u.email AS owner_email
     FROM business_member_invites bi
     JOIN users u ON u.id = bi.owner_user_id
     WHERE LOWER(bi.member_email) = ? AND bi.status = 'pending'
     ORDER BY bi.id DESC
     LIMIT 1`,
    [email]
  );

  return inviteRows[0] ?? null;
}

async function getApprovedMembershipForOtherOwner(email: string, currentOwnerId: number) {
  const [rows]: any = await db.execute(
    `SELECT id
     FROM business_members
     WHERE LOWER(member_email) = ? AND status = 'active' AND owner_user_id <> ?
     LIMIT 1`,
    [email, currentOwnerId]
  );

  return rows[0] ?? null;
}

async function getOwnerPlan(ownerUserId: number) {
  const [ownerSubRows]: any = await db.execute(
    `SELECT plan_name
     FROM subscriptions
     WHERE user_id = ? AND LOWER(status) = 'active' AND start_date <= NOW() AND end_date >= NOW()
     ORDER BY end_date DESC
     LIMIT 1`,
    [ownerUserId]
  );

  if (!ownerSubRows[0]) {
    return null;
  }

  const ownerPlanName = normalizePlanName(ownerSubRows[0].plan_name);
  if (!isBusinessPlan(ownerPlanName)) {
    return null;
  }

  return ownerPlanName;
}

export async function GET(req: NextRequest) {
  try {
    const currentUser = getUserFromRequest(req);
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invite = await getPendingInviteForUser(currentUser.email);
    if (!invite) {
      return NextResponse.json({ pendingMembership: null });
    }

    const ownerPlanName = await getOwnerPlan(invite.owner_user_id);
    if (!ownerPlanName) {
      return NextResponse.json({ pendingMembership: null });
    }

    return NextResponse.json({
      pendingMembership: {
        id: invite.id,
        member_email: invite.member_email,
        owner_email: invite.owner_email,
        plan_name: ownerPlanName,
        status: "pending",
        invited_at: invite.created_at,
      },
    });
  } catch (err: any) {
    if (err?.code === "ER_NO_SUCH_TABLE") {
      return NextResponse.json({ pendingMembership: null });
    }
    console.error("GET /api/business-members/accept error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = getUserFromRequest(req);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Please sign in with the invited account before accepting this membership." },
        { status: 401 }
      );
    }

    const invite = await getPendingInviteForUser(currentUser.email);
    if (!invite) {
      return NextResponse.json({ error: "No pending membership request found." }, { status: 404 });
    }

    const ownerPlanName = await getOwnerPlan(invite.owner_user_id);
    if (!ownerPlanName) {
      return NextResponse.json(
        { error: "The owner does not currently have an active business subscription." },
        { status: 400 }
      );
    }

    const alreadyAssignedElsewhere = await getApprovedMembershipForOtherOwner(
      currentUser.email,
      invite.owner_user_id
    );
    if (alreadyAssignedElsewhere) {
      return NextResponse.json(
        { error: "This user is already associated with another membership account." },
        { status: 409 }
      );
    }

    const seatLimit = getBusinessSeatLimit(ownerPlanName);
    const [activeCountRows]: any = await db.execute(
      `SELECT COUNT(*) AS cnt FROM business_members
       WHERE owner_user_id = ? AND status = 'active'`,
      [invite.owner_user_id]
    );
    const currentActiveCount = Number(activeCountRows[0]?.cnt ?? 0);

    const [existingMemberRows]: any = await db.execute(
      `SELECT id, status
       FROM business_members
       WHERE owner_user_id = ? AND LOWER(member_email) = ?
       LIMIT 1`,
      [invite.owner_user_id, currentUser.email]
    );

    const existingMember = existingMemberRows[0];
    const alreadyActive = existingMember && existingMember.status === "active";

    if (!alreadyActive && currentActiveCount >= seatLimit) {
      return NextResponse.json(
        { error: "Seat limit reached for this plan. Ask the owner to remove another member first." },
        { status: 409 }
      );
    }

    if (existingMember) {
      await db.execute(
        `UPDATE business_members
         SET status = 'active', member_user_id = ?, plan_name = ?, updated_at = NOW()
         WHERE id = ?`,
        [currentUser.id, ownerPlanName, existingMember.id]
      );
    } else {
      await db.execute(
        `INSERT INTO business_members (owner_user_id, member_email, member_user_id, plan_name, status)
         VALUES (?, ?, ?, ?, 'active')`,
        [invite.owner_user_id, currentUser.email, currentUser.id, ownerPlanName]
      );
    }

    await db.execute(
      `UPDATE business_member_invites
       SET status = 'accepted', invited_user_id = ?, accepted_at = NOW(), plan_name = ?, updated_at = NOW()
       WHERE id = ?`,
      [currentUser.id, ownerPlanName, invite.id]
    );

    await db.execute(
      `UPDATE business_member_invites
       SET status = 'revoked', updated_at = NOW()
       WHERE owner_user_id = ? AND LOWER(member_email) = ? AND status = 'pending' AND id <> ?`,
      [invite.owner_user_id, currentUser.email, invite.id]
    );

    return NextResponse.json({
      success: true,
      message: "Membership approved successfully.",
      ownerEmail: invite.owner_email,
      planName: ownerPlanName,
      membership_status: "approved",
      membership_approved: true,
    });
  } catch (err: any) {
    if (err?.code === "ER_NO_SUCH_TABLE") {
      return NextResponse.json(
        { error: "Invite storage is not initialized. Please run migration 004_business_member_invites.sql." },
        { status: 500 }
      );
    }
    console.error("POST /api/business-members/accept error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
