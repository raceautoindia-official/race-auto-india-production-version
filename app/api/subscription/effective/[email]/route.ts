import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/subscription/effective/[email]
 *
 * Resolves BOTH own subscription AND shared membership independently.
 * Returns: { own: {...}|null, membership: {...}|null }
 *
 * - `own`        — user's own active subscription row (is_member: false), or null
 * - `membership` — active shared-business membership row (is_member: true), or null
 *
 * Both are checked regardless of each other so a child user can have both.
 * The existing /api/profile/subscription/[email] endpoint is NOT modified.
 */
export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const email = decodeURIComponent(pathname.split("/").pop() ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Resolve user record
    const [userRows]: any = await db.execute(
      `SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [email]
    );
    const userId: number | null = userRows[0]?.id ?? null;

    // 2. Check own active subscription (independent of membership)
    let ownSub: any = null;
    if (userId) {
      const [ownRows]: any = await db.execute(
        `SELECT * FROM subscriptions
         WHERE user_id = ? AND LOWER(status) = 'active' AND end_date >= NOW()
         ORDER BY end_date DESC
         LIMIT 1`,
        [userId]
      );
      if (ownRows.length > 0) {
        ownSub = { ...ownRows[0], is_member: false };
      }
    }

    // 3. Check business membership (by email — works even before user registers)
    let membershipSub: any = null;
    const [memberRow]: any = await db.execute(
      `SELECT bm.owner_user_id, bm.plan_name, bm.status AS member_status
       FROM business_members bm
       WHERE LOWER(bm.member_email) = ? AND bm.status = 'active'
       LIMIT 1`,
      [email]
    );

    if (memberRow.length > 0) {
      const ownerUserId = memberRow[0].owner_user_id;
      const memberPlanName = memberRow[0].plan_name;

      // Verify owner's subscription is still active
      const [ownerSub]: any = await db.execute(
        `SELECT s.*, u.email AS owner_email
         FROM subscriptions s
         JOIN users u ON u.id = s.user_id
         WHERE s.user_id = ? AND LOWER(s.status) = 'active' AND s.end_date >= NOW()
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
        };
      }
    }

    // 4. Return both independently — caller decides how to display them
    return NextResponse.json({ own: ownSub, membership: membershipSub });
  } catch (err) {
    console.error("GET /api/subscription/effective error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
