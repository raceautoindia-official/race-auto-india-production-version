import db from "@/lib/db";
import Razorpay from "razorpay";
import { checkInternalApiKey } from "@/lib/internalAuth";
import { NextRequest, NextResponse } from "next/server";
import { activateFromOrder } from "@/lib/subscriptionActivation";

export const dynamic = "force-dynamic";

/**
 * GET /api/internal/subscription/reconcile-orders
 * Protected by x-internal-api-key. Meant to be hit by a scheduler (e.g. every
 * 10-15 min), like send-expiry-reminders.
 *
 * Third and final payment-integrity layer (after verify-payment and the webhook):
 * finds orders that were CREATED but never reached 'activated' and are old enough
 * that both the browser and the webhook have had time to run, then asks Razorpay
 * whether the order was actually paid. If a captured payment exists, it activates
 * the subscription via the same idempotent path — so a captured payment can never
 * be silently lost (money taken, no access).
 */
export async function GET(req: NextRequest) {
  const denied = checkInternalApiKey(req);
  if (denied) return denied;

  try {
    // Grace window: at least 15 min old (verify + webhook had their chance), no
    // older than 3 days (avoid re-checking ancient abandoned orders). Bounded.
    const [rows]: any = await db
      .execute(
        `SELECT razorpay_order_id, email, plan_name, duration, status
         FROM payment_orders
         WHERE status IN ('created','paid')
           AND created_at <= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
           AND created_at >= DATE_SUB(NOW(), INTERVAL 3 DAY)
         ORDER BY created_at ASC
         LIMIT 100`,
      )
      .catch(() => [[]]); // table may not exist yet on an older deploy

    const orders = Array.isArray(rows) ? rows : [];

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    let checked = 0;
    let activated = 0;
    let stillPending = 0;
    let notPaid = 0;
    let errors = 0;

    for (const row of orders) {
      checked += 1;
      try {
        const payments: any = await razorpay.orders.fetchPayments(
          row.razorpay_order_id,
        );
        const captured = (payments?.items || []).find(
          (p: any) => String(p?.status || "").toLowerCase() === "captured",
        );

        if (!captured) {
          notPaid += 1;
          continue;
        }

        const result = await activateFromOrder({
          orderId: row.razorpay_order_id,
          paymentId: captured.id,
          email: row.email,
          planName: row.plan_name,
          duration: row.duration,
          orderStatus: row.status,
        });

        if (result.activated || result.reason === "already_active") {
          activated += 1;
        } else {
          stillPending += 1;
        }
      } catch (e) {
        errors += 1;
        console.error(
          "reconcile-orders row error:",
          row.razorpay_order_id,
          e,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      checked,
      activated,
      stillPending,
      notPaid,
      errors,
    });
  } catch (err) {
    console.error("reconcile-orders error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
