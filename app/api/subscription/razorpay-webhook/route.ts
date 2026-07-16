import db from "@/lib/db";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { activateFromOrder } from "@/lib/subscriptionActivation";

// Razorpay server-to-server webhook. Guaranteed-delivery safety net for the
// browser-driven verify-payment flow: if the buyer closes the tab / a UPI app
// never redirects back, Razorpay still POSTs payment.captured / order.paid here
// and we activate the subscription the browser would have.
//
// Register in the Razorpay dashboard: URL = /api/subscription/razorpay-webhook,
// events = payment.captured (and/or order.paid), secret = RAZORPAY_WEBHOOK_SECRET.
//
// Activation is delegated to the shared, idempotent activateFromOrder() (also used
// by the reconciliation cron), so repeat webhooks / both events firing are no-ops
// and it never races the browser path.
export const dynamic = "force-dynamic";

function timingSafeEqualHex(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("razorpay-webhook: RAZORPAY_WEBHOOK_SECRET not configured");
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  // Raw body is REQUIRED — the signature is an HMAC over the exact bytes.
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (!timingSafeEqualHex(signature, expected)) {
    return NextResponse.json(
      { ok: false, message: "invalid signature" },
      { status: 400 },
    );
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, message: "bad payload" }, { status: 400 });
  }

  const type = String(event?.event || "");
  // Only a successful capture/paid event activates access.
  if (type !== "payment.captured" && type !== "order.paid") {
    return NextResponse.json({ ok: true, ignored: type }, { status: 200 });
  }

  const paymentEntity = event?.payload?.payment?.entity || null;
  const orderEntity = event?.payload?.order?.entity || null;
  const orderId = paymentEntity?.order_id || orderEntity?.id || null;
  const paymentId = paymentEntity?.id || null;

  if (!orderId) {
    return NextResponse.json({ ok: true, message: "no order id" }, { status: 200 });
  }

  try {
    // Stored purchase intent — the source of email/plan and the idempotency guard.
    const [orderRows]: any = await db
      .execute(
        `SELECT email, plan_name, duration, status
         FROM payment_orders WHERE razorpay_order_id = ? LIMIT 1`,
        [orderId],
      )
      .catch(() => [[]]); // table may not exist yet on an older deploy
    const order = Array.isArray(orderRows) ? orderRows[0] : null;

    // Fall back to Razorpay notes for legacy orders with no stored intent.
    const notes = paymentEntity?.notes || orderEntity?.notes || {};

    const result = await activateFromOrder({
      orderId,
      paymentId,
      email: order?.email || notes?.email,
      planName: order?.plan_name || notes?.plan,
      duration: order?.duration || notes?.duration,
      orderStatus: order?.status ?? null,
    });

    if (result.reason === "missing_data") {
      console.warn("razorpay-webhook: captured but missing email/plan", { orderId });
      return NextResponse.json({ ok: true, pendingReconciliation: true }, { status: 200 });
    }
    if (result.reason === "user_not_found") {
      console.warn("razorpay-webhook: user not found for order", { orderId });
      return NextResponse.json({ ok: true, userNotFound: true }, { status: 200 });
    }

    return NextResponse.json({ ok: true, activated: result.activated }, { status: 200 });
  } catch (err) {
    console.error("razorpay-webhook error:", err);
    // 500 → Razorpay retries with backoff.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
