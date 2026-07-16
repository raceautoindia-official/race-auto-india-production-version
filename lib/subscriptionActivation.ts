import db from "@/lib/db";
import { getPlanCodeFromName } from "@/lib/subscriptionPlan";

// Shared, idempotent subscription activation from a stored payment_orders intent.
// Used by BOTH the Razorpay webhook and the reconciliation cron so the activation
// logic can never drift between them. Safe to call repeatedly for the same order.

export function durationDaysFor(duration: string | null | undefined): number {
  return String(duration || "").toLowerCase().trim() === "annual" ? 365 : 30;
}

export type ActivationReason =
  | "activated"
  | "already_active"
  | "already_activated_order"
  | "missing_data"
  | "user_not_found";

export interface ActivationResult {
  ok: boolean;
  activated: boolean;
  reason: ActivationReason;
}

export async function activateFromOrder(params: {
  orderId: string;
  paymentId: string | null;
  email: string | null | undefined;
  planName: string | null | undefined;
  duration: string | null | undefined;
  /** payment_orders.status if known — 'activated' short-circuits to a no-op. */
  orderStatus?: string | null;
}): Promise<ActivationResult> {
  const { orderId, paymentId } = params;
  const email = String(params.email || "").trim() || null;
  const planName = String(params.planName || "").toLowerCase().trim() || null;
  const duration = String(params.duration || "").toLowerCase().trim() || null;

  // Already activated → idempotent no-op (repeat webhook / reconcile after webhook).
  if (params.orderStatus === "activated") {
    return { ok: true, activated: false, reason: "already_activated_order" };
  }

  // Can't safely activate without who + which plan — leave for the next
  // reconciliation pass (mark 'paid' so it's visible as captured-not-activated).
  if (!email || !planName) {
    await db
      .execute(
        `UPDATE payment_orders SET status = 'paid', razorpay_payment_id = ?
         WHERE razorpay_order_id = ? AND status <> 'activated'`,
        [paymentId, orderId],
      )
      .catch(() => {});
    return { ok: true, activated: false, reason: "missing_data" };
  }

  const [userRows]: any = await db.execute(
    `SELECT id FROM users WHERE email = ? LIMIT 1`,
    [email],
  );
  const userId = userRows?.[0]?.id ?? null;
  if (!userId) {
    return { ok: true, activated: false, reason: "user_not_found" };
  }

  // If a live subscription already exists (browser verify-payment won the race),
  // don't overwrite its dates — just reconcile the order row below.
  const [activeRows]: any = await db.execute(
    `SELECT id FROM subscriptions
     WHERE user_id = ? AND LOWER(status) = 'active' AND start_date <= NOW() AND end_date >= NOW()
     LIMIT 1`,
    [userId],
  );
  const alreadyActive = Array.isArray(activeRows) && activeRows.length > 0;

  if (!alreadyActive) {
    const durationDays = durationDaysFor(duration);
    const [existing]: any = await db.execute(
      `SELECT id FROM subscriptions WHERE user_id = ? LIMIT 1`,
      [userId],
    );

    if (Array.isArray(existing) && existing.length > 0) {
      await db.execute(
        `UPDATE subscriptions
         SET payment_id = ?, plan_name = ?, start_date = NOW(),
             end_date = DATE_ADD(NOW(), INTERVAL ? DAY), status = 'Active'
         WHERE user_id = ?`,
        [paymentId, planName, durationDays, userId],
      );
    } else {
      await db.execute(
        `INSERT INTO subscriptions (user_id, payment_id, plan_name, start_date, end_date, status)
         VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 'Active')`,
        [userId, paymentId, planName, durationDays],
      );
    }

    await db.execute(`UPDATE users SET subscription = ? WHERE id = ?`, [
      getPlanCodeFromName(planName),
      userId,
    ]);
  }

  // Mark the order activated — the idempotency guard for repeat calls.
  await db
    .execute(
      `UPDATE payment_orders
       SET status = 'activated', razorpay_payment_id = ?, activated_at = NOW()
       WHERE razorpay_order_id = ?`,
      [paymentId, orderId],
    )
    .catch(() => {});

  return {
    ok: true,
    activated: !alreadyActive,
    reason: alreadyActive ? "already_active" : "activated",
  };
}
