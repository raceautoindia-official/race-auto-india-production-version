import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/subscription/effective/[email]
 *
 * Resolves own subscription and shared membership independently.
 * Returns: { own, membership, pendingMembership }
 */
export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const email = decodeURIComponent(pathname.split("/").pop() ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const [userRows]: any = await db.execute(
      `SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [email]
    );
    const userId: number | null = userRows[0]?.id ?? null;

    let ownSub: any = null;
    if (userId) {
      const [ownRows]: any = await db.execute(
        `SELECT * FROM subscriptions
         WHERE user_id = ? AND LOWER(status) = 'active' AND start_date <= NOW() AND end_date >= NOW()
         ORDER BY end_date DESC
         LIMIT 1`,
        [userId]
      );
      if (ownRows.length > 0) {
        ownSub = { ...ownRows[0], is_member: false };
      }
    }

    let membershipSub: any = null;
    const [memberRow]: any = await db.execute(
      `SELECT bm.owner_user_id, bm.plan_name
       FROM business_members bm
       WHERE LOWER(bm.member_email) = ? AND bm.status = 'active'
       LIMIT 1`,
      [email]
    );

    if (memberRow.length > 0) {
      const ownerUserId = memberRow[0].owner_user_id;
      const memberPlanName = memberRow[0].plan_name;

      const [ownerSub]: any = await db.execute(
        `SELECT s.*, u.email AS owner_email
         FROM subscriptions s
         JOIN users u ON u.id = s.user_id
         WHERE s.user_id = ? AND LOWER(s.status) = 'active' AND s.start_date <= NOW() AND s.end_date >= NOW()
         ORDER BY s.end_date DESC
         LIMIT 1`,
        [ownerUserId]
      );

      if (ownerSub.length > 0) {
        membershipSub = {
          id: ownerSub[0].id,
          user_id: userId,
          payment_id: ownerSub[0].payment_id,
          plan_name: memberPlanName,
          start_date: ownerSub[0].start_date,
          end_date: ownerSub[0].end_date,
          status: "Active",
          is_member: true,
          owner_email: ownerSub[0].owner_email,
          membership_status: "approved",
          membership_approved: true,
        };
      }
    }

    let pendingMembership: any = null;
    const [pendingRows]: any = await db.execute(
      `SELECT bi.id, bi.owner_user_id, bi.plan_name, bi.created_at, u.email AS owner_email
       FROM business_member_invites bi
       JOIN users u ON u.id = bi.owner_user_id
       WHERE LOWER(bi.member_email) = ? AND bi.status = 'pending'
       ORDER BY bi.id DESC
       LIMIT 1`,
      [email]
    ).catch(() => [[]]);

    if (Array.isArray(pendingRows) && pendingRows.length > 0) {
      const [ownerSub]: any = await db.execute(
        `SELECT end_date
         FROM subscriptions
         WHERE user_id = ? AND LOWER(status) = 'active' AND start_date <= NOW() AND end_date >= NOW()
         ORDER BY end_date DESC
         LIMIT 1`,
        [pendingRows[0].owner_user_id]
      );

      if (ownerSub.length > 0) {
        pendingMembership = {
          id: pendingRows[0].id,
          owner_email: pendingRows[0].owner_email,
          plan_name: pendingRows[0].plan_name,
          invited_at: pendingRows[0].created_at,
          status: "pending",
          membership_status: "pending",
          membership_approved: false,
        };
      }
    }

    return NextResponse.json({
      own: ownSub,
      membership: membershipSub,
      pendingMembership,
    });
  } catch (err) {
    console.error("GET /api/subscription/effective error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
