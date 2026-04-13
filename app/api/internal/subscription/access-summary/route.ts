import db from "@/lib/db";
import { checkInternalApiKey } from "@/lib/internalAuth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/internal/subscription/access-summary?email=user@example.com
 *
 * Internal service-to-service API for Race Auto Analytics.
 * Protected by x-internal-api-key header.
 *
 * Resolves both direct subscription AND shared business membership independently.
 * If both exist, own (direct) plan is authoritative for effectivePlan.
 *
 * Response:
 * {
 *   email, hasDirectPlan, hasSharedPlan,
 *   accessType: "direct" | "shared" | "free",
 *   directPlan: { planName, status, startDate, endDate } | null,
 *   sharedPlan: { planName, status, parentEmail, startDate, endDate } | null,
 *   effectivePlan: "bronze"|"silver"|"gold"|"platinum"|null,
 *   effectiveStatus: "active"|"inactive"|"free",
 *   planSource: "direct"|"shared"|null
 * }
 */
export async function GET(req: NextRequest) {
  const denied = checkInternalApiKey(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const email = (searchParams.get("email") ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "email query parameter is required" }, { status: 400 });
    }

    // ── 1. Look up user ──────────────────────────────────────────────────────
    const [userRows]: any = await db.execute(
      `SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [email]
    );
    const userId: number | null = userRows[0]?.id ?? null;

    // ── 2. Check direct (own) active subscription ────────────────────────────
    let directPlan: {
      planName: string;
      status: string;
      startDate: string | null;
      endDate: string | null;
    } | null = null;

    if (userId) {
      const [ownRows]: any = await db.execute(
        `SELECT plan_name, status, start_date, end_date
         FROM subscriptions
         WHERE user_id = ? AND LOWER(status) = 'active' AND end_date >= NOW()
         ORDER BY end_date DESC
         LIMIT 1`,
        [userId]
      );
      if (ownRows.length > 0) {
        const r = ownRows[0];
        directPlan = {
          planName: String(r.plan_name ?? "").toLowerCase(),
          status: "active",
          startDate: r.start_date ? String(r.start_date) : null,
          endDate: r.end_date ? String(r.end_date) : null,
        };
      }
    }

    // ── 3. Check shared business membership ──────────────────────────────────
    let sharedPlan: {
      planName: string;
      status: string;
      parentEmail: string | null;
      startDate: string | null;
      endDate: string | null;
    } | null = null;

    const [memberRow]: any = await db.execute(
      `SELECT bm.owner_user_id, bm.plan_name
       FROM business_members bm
       WHERE LOWER(bm.member_email) = ? AND bm.status = 'active'
       LIMIT 1`,
      [email]
    ).catch(() => [[]]); // gracefully ignore if table doesn't exist yet

    if (Array.isArray(memberRow) && memberRow.length > 0) {
      const ownerUserId = memberRow[0].owner_user_id;
      const memberPlanName = String(memberRow[0].plan_name ?? "").toLowerCase();

      const [ownerSub]: any = await db.execute(
        `SELECT s.start_date, s.end_date, u.email AS owner_email
         FROM subscriptions s
         JOIN users u ON u.id = s.user_id
         WHERE s.user_id = ? AND LOWER(s.status) = 'active' AND s.end_date >= NOW()
         ORDER BY s.end_date DESC
         LIMIT 1`,
        [ownerUserId]
      );

      if (ownerSub.length > 0) {
        sharedPlan = {
          planName: memberPlanName,
          status: "active",
          parentEmail: ownerSub[0].owner_email ?? null,
          startDate: ownerSub[0].start_date ? String(ownerSub[0].start_date) : null,
          endDate: ownerSub[0].end_date ? String(ownerSub[0].end_date) : null,
        };
      }
    }

    // ── 4. Resolve effective plan (direct takes priority) ────────────────────
    const hasDirectPlan = directPlan !== null;
    const hasSharedPlan = sharedPlan !== null;

    let effectivePlan: string | null = null;
    let accessType: "direct" | "shared" | "free" = "free";
    let planSource: "direct" | "shared" | null = null;

    if (hasDirectPlan) {
      effectivePlan = directPlan!.planName;
      accessType = "direct";
      planSource = "direct";
    } else if (hasSharedPlan) {
      effectivePlan = sharedPlan!.planName;
      accessType = "shared";
      planSource = "shared";
    }

    const effectiveStatus: "active" | "inactive" | "free" =
      hasDirectPlan || hasSharedPlan ? "active" : "free";

    return NextResponse.json({
      email,
      hasDirectPlan,
      hasSharedPlan,
      accessType,
      directPlan,
      sharedPlan,
      effectivePlan,
      effectiveStatus,
      planSource,
    });
  } catch (err) {
    console.error("GET /api/internal/subscription/access-summary error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
