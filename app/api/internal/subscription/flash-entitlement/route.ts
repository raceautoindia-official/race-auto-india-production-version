import db from "@/lib/db";
import { checkInternalApiKey } from "@/lib/internalAuth";
import { NextRequest, NextResponse } from "next/server";

function isEffectivelyActive(status: any, endDate: any): boolean {
  const statusValue = String(status || "").toLowerCase().trim();
  if (statusValue !== "active") return false;
  if (!endDate) return false;
  const expiryMs = new Date(endDate).getTime();
  return Number.isFinite(expiryMs) && expiryMs >= Date.now();
}

/**
 * GET /api/internal/subscription/flash-entitlement?email=user@example.com
 *
 * Internal service-to-service API for Race Auto Analytics — Flash Reports entitlement.
 * Protected by x-internal-api-key header.
 *
 * Flash Report country limit mapping (internal plan values preserved):
 *   bronze   → 1
 *   silver   → 4
 *   gold     → 5
 *   platinum → 11
 *   free     → 0
 *
 * Resolves both direct subscription AND shared business membership.
 * Direct (own) plan takes priority when both exist.
 *
 * Response:
 * {
 *   email,
 *   effectivePlan: "bronze"|"silver"|"gold"|"platinum"|null,
 *   accessType: "direct"|"shared"|"free",
 *   isSubscribed: boolean,
 *   effectiveStatus: "active"|"free",
 *   parentEmail: string|null,
 *   flashReportCountryLimit: number,
 *   hasDirectPlan: boolean,
 *   hasSharedPlan: boolean
 * }
 */

const FLASH_COUNTRY_LIMIT: Record<string, number> = {
  bronze: 1,
  silver: 4,
  gold: 5,
  platinum: 11,
};

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
      `SELECT id, role FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [email]
    );
    const userId: number | null = userRows[0]?.id ?? null;
    const role: string | null = userRows[0]?.role ? String(userRows[0].role) : null;
    let pendingMembershipStatus: "pending" | null = null;

    // ── 2. Check direct (own) active subscription ────────────────────────────
    let directPlanName: string | null = null;
    let directPlanEndDate: string | null = null;

    if (userId) {
      const [ownRows]: any = await db.execute(
        `SELECT plan_name FROM subscriptions
         WHERE user_id = ? AND LOWER(status) = 'active' AND start_date <= NOW() AND end_date >= NOW()
         ORDER BY end_date DESC
         LIMIT 1`,
        [userId]
      );
      if (ownRows.length > 0) {
        directPlanName = String(ownRows[0].plan_name ?? "").toLowerCase();
        directPlanEndDate = ownRows[0].end_date ? String(ownRows[0].end_date) : null;
      }
    }

    // ── 3. Check shared business membership ──────────────────────────────────
    let sharedPlanName: string | null = null;
    let parentEmail: string | null = null;
    let sharedPlanEndDate: string | null = null;

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
        `SELECT s.end_date, u.email AS owner_email
         FROM subscriptions s
         JOIN users u ON u.id = s.user_id
         WHERE s.user_id = ? AND LOWER(s.status) = 'active' AND s.start_date <= NOW() AND s.end_date >= NOW()
         ORDER BY s.end_date DESC
         LIMIT 1`,
        [ownerUserId]
      );

      if (ownerSub.length > 0) {
        sharedPlanName = memberPlanName;
        parentEmail = ownerSub[0].owner_email ?? null;
        sharedPlanEndDate = ownerSub[0].end_date ? String(ownerSub[0].end_date) : null;
      }
    }

    if (!sharedPlanName) {
      const [pendingRows]: any = await db.execute(
        `SELECT owner_user_id
         FROM business_member_invites
         WHERE LOWER(member_email) = ? AND status = 'pending'
         ORDER BY id DESC
         LIMIT 1`,
        [email]
      ).catch(() => [[]]);

      if (Array.isArray(pendingRows) && pendingRows.length > 0) {
        const [ownerSub]: any = await db.execute(
          `SELECT 1
           FROM subscriptions
           WHERE user_id = ? AND LOWER(status) = 'active' AND start_date <= NOW() AND end_date >= NOW()
           ORDER BY end_date DESC
           LIMIT 1`,
          [pendingRows[0].owner_user_id]
        );

        if (ownerSub.length > 0) {
          pendingMembershipStatus = "pending";
        }
      }
    }

    // ── 4. Resolve effective plan (direct takes priority) ────────────────────
    const hasDirectPlan = directPlanName !== null;
    const hasSharedPlan = sharedPlanName !== null;

    let effectivePlan: string | null = null;
    let accessType: "direct" | "shared" | "free" = "free";

    if (hasDirectPlan) {
      effectivePlan = directPlanName;
      accessType = "direct";
      parentEmail = null; // not a shared user
    } else if (hasSharedPlan) {
      effectivePlan = sharedPlanName;
      accessType = "shared";
    }

    const directActive = hasDirectPlan
      ? isEffectivelyActive("active", directPlanEndDate)
      : false;
    const sharedActive = hasSharedPlan
      ? isEffectivelyActive("active", sharedPlanEndDate)
      : false;

    const isSubscribed = directActive || sharedActive;
    const effectiveStatus = isSubscribed ? "active" : "free";
    const flashReportCountryLimit =
      effectivePlan ? (FLASH_COUNTRY_LIMIT[effectivePlan] ?? 0) : 0;

    return NextResponse.json({
      email,
      role,
      effectivePlan,
      accessType,
      isSubscribed,
      effectiveStatus,
      parentEmail,
      flashReportCountryLimit,
      hasDirectPlan,
      hasSharedPlan,
      membership_status: hasSharedPlan ? "approved" : pendingMembershipStatus,
      membership_approved: hasSharedPlan ? true : pendingMembershipStatus ? false : null,
    });
  } catch (err) {
    console.error("GET /api/internal/subscription/flash-entitlement error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
