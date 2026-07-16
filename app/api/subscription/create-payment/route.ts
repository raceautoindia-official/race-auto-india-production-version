import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: NextRequest) {
  try {
    // `plan` and `duration` are OPTIONAL and backward-compatible: older clients
    // send only { customer_email, AMT } and continue to work. When present, they
    // let the webhook activate the correct plan if the browser never returns.
    const { customer_email, AMT, plan, duration } = await req.json();

    if (!customer_email || !AMT) {
      return NextResponse.json(
        { success: false, message: "customer_email and AMT are required" },
        {
          status: 400,
          headers: corsHeaders(req.headers.get("origin")),
        }
      );
    }

    const planName = String(plan || "").toLowerCase().trim() || null;
    const durationType = String(duration || "").toLowerCase().trim() || null;

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const subscription = await razorpay.orders.create({
      amount: Number(AMT) * 100,
      currency: "INR",
      receipt: `receipt_${Math.random().toString(36).substring(7)}`,
      notes: {
        email: customer_email,
        ...(planName ? { plan: planName } : {}),
        ...(durationType ? { duration: durationType } : {}),
      },
    });

    // Persist the purchase intent so the Razorpay webhook can activate the right
    // plan even if the browser never returns to verify-payment. Guarded so a DB
    // hiccup (or the table not existing yet) can NEVER block checkout.
    try {
      await db.execute(
        `INSERT INTO payment_orders (razorpay_order_id, email, plan_name, duration, amount, status)
         VALUES (?, ?, ?, ?, ?, 'created')
         ON DUPLICATE KEY UPDATE
           email = VALUES(email), plan_name = VALUES(plan_name),
           duration = VALUES(duration), amount = VALUES(amount)`,
        [subscription.id, customer_email, planName, durationType, Number(AMT)],
      );
    } catch (persistErr) {
      console.error("create-payment: payment_orders persist skipped:", persistErr);
    }

    return NextResponse.json(subscription, {
      status: 200,
      headers: corsHeaders(req.headers.get("origin")),
    });
  } catch (err) {
    console.error("create-payment error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders(req.headers.get("origin")),
      }
    );
  }
}