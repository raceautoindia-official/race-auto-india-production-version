import db from "@/lib/db";
import jwt from "jsonwebtoken";

type AuthUser = {
  id: number | null;
  email: string | null;
  role?: string | null;
};

type EligibilityResult = {
  showPopup: boolean;
  reason:
    | "guest_user"
    | "eligible_logged_in_user"
    | "already_subscribed"
    | "trial_already_consumed"
    | "lead_already_submitted"
    | "user_not_found"
    | "server_fallback_guest";
  user?: AuthUser | null;
};

export function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

export function getAuthUserFromRequest(req: any): AuthUser | null {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) return null;

    const secret = process.env.JWT_KEY;
    if (!secret) return null;

    const decoded = jwt.verify(token, secret) as any;
    return {
      id: decoded?.id ? Number(decoded.id) : null,
      email: decoded?.email ? String(decoded.email) : null,
      role: decoded?.role ?? null,
    };
  } catch {
    return null;
  }
}

export async function hasLeadAlreadySubmitted(params: {
  userId?: number | null;
  email?: string | null;
}) {
  const checks: string[] = [];
  const values: any[] = [];

  if (params.userId) {
    checks.push("user_id = ?");
    values.push(params.userId);
  }
  if (params.email) {
    checks.push("LOWER(email) = ?");
    values.push(normalizeEmail(params.email));
  }

  if (checks.length === 0) return false;

  const sql = `
    SELECT id
    FROM free_trial_leads
    WHERE ${checks.join(" OR ")}
    LIMIT 1
  `;
  const [rows]: any = await db.query(sql, values);
  return Array.isArray(rows) && rows.length > 0;
}

/**
 * Existing paid subscription check.
 * We check BOTH:
 * 1) users.subscription > 0
 * 2) active row in subscriptions
 */
export async function hasActivePaidSubscription(userId: number) {
  // Check users.subscription flag
  const [userRows]: any = await db.query(
    `SELECT id, subscription FROM users WHERE id = ? LIMIT 1`,
    [userId]
  );

  if (!Array.isArray(userRows) || userRows.length === 0) {
    return { exists: false, userFound: false };
  }

  const user = userRows[0];
  if (Number(user.subscription || 0) > 0) {
    return { exists: true, userFound: true };
  }

  // Backup check in subscriptions table (active + end_date not expired)
  const [subRows]: any = await db.query(
    `
    SELECT id
    FROM subscriptions
    WHERE user_id = ?
      AND LOWER(status) = 'active'
      AND (end_date IS NULL OR end_date >= NOW())
    LIMIT 1
    `,
    [userId]
  );

  return {
    exists: Array.isArray(subRows) && subRows.length > 0,
    userFound: true,
  };
}

/**
 * Trial consumed check from OLD SYSTEM.
 *
 * IMPORTANT:
 * Replace this query with your actual old trial-consumed source.
 * For now, this checks a few common patterns safely.
 */
export async function hasConsumedTrialInOldSystem(params: {
  userId?: number | null;
  email?: string | null;
}) {
  const { userId, email } = params;

  try {
    // ---- Option 1: if users table has a free_trial_consumed column (common pattern)
    if (userId) {
      try {
        const [rows]: any = await db.query(
          `SELECT free_trial_consumed FROM users WHERE id = ? LIMIT 1`,
          [userId]
        );
        if (
          Array.isArray(rows) &&
          rows.length > 0 &&
          Number(rows[0]?.free_trial_consumed || 0) === 1
        ) {
          return true;
        }
      } catch {
        // column may not exist in your DB; ignore
      }
    }

    // ---- Option 2: if old system marks trial in subscriptions history (example)
    // Adjust this to your exact schema if you store trial rows.
    if (userId) {
      try {
        const [trialSubRows]: any = await db.query(
          `
          SELECT id
          FROM subscriptions
          WHERE user_id = ?
            AND (
              LOWER(plan_name) LIKE '%trial%'
              OR LOWER(status) = 'trial'
            )
          LIMIT 1
          `,
          [userId]
        );
        if (Array.isArray(trialSubRows) && trialSubRows.length > 0) return true;
      } catch {
        // if status/plan conventions differ, ignore
      }
    }

    // ---- Option 3: if only email is available and old table stores trial by email (optional)
    // Add your own email-based old system check here if needed.

    return false;
  } catch {
    return false;
  }
}

export async function getFreeTrialLeadEligibility(req: any): Promise<EligibilityResult> {
  try {
    const authUser = getAuthUserFromRequest(req);

    // Guest users should see popup (lead capture)
    if (!authUser?.id && !authUser?.email) {
      return { showPopup: true, reason: "guest_user", user: null };
    }

    // Logged-in user but no valid user id => fallback (treat as guest)
    if (!authUser?.id) {
      return { showPopup: true, reason: "server_fallback_guest", user: authUser };
    }

    // 1) Active paid subscription
    const activeSub = await hasActivePaidSubscription(authUser.id);
    if (!activeSub.userFound) {
      // If token user not found in DB, fallback guest-style popup
      return { showPopup: true, reason: "user_not_found", user: authUser };
    }
    if (activeSub.exists) {
      return { showPopup: false, reason: "already_subscribed", user: authUser };
    }

    // 2) Trial consumed in old system
    const trialConsumed = await hasConsumedTrialInOldSystem({
      userId: authUser.id,
      email: authUser.email,
    });
    if (trialConsumed) {
      return { showPopup: false, reason: "trial_already_consumed", user: authUser };
    }

    // 3) Already submitted lead form
    const leadExists = await hasLeadAlreadySubmitted({
      userId: authUser.id,
      email: authUser.email,
    });
    if (leadExists) {
      return { showPopup: false, reason: "lead_already_submitted", user: authUser };
    }

    return { showPopup: true, reason: "eligible_logged_in_user", user: authUser };
  } catch (error) {
    console.error("getFreeTrialLeadEligibility error:", error);
    // fail-open for guest-style UX (can change to fail-closed if you prefer)
    return { showPopup: true, reason: "server_fallback_guest", user: null };
  }
}