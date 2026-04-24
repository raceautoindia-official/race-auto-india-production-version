import db from "@/lib/db";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";
import { getPlanCodeFromName } from "@/lib/subscriptionPlan";
import { subscriptionConfirmationEmailTemplate } from "@/lib/emailTemplates";
import { sendSesEmail } from "@/lib/sesMailer";
import { markEmailEventIfNew } from "@/lib/emailNotificationLog";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      plan,
      duration,
      AMT,
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        {
          status: 400,
          headers: corsHeaders(req.headers.get("origin")),
        }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET as string;

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid Subscription Signature" },
        {
          status: 403,
          headers: corsHeaders(req.headers.get("origin")),
        }
      );
    }

    const [user]: any = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (!user[0]) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        {
          status: 400,
          headers: corsHeaders(req.headers.get("origin")),
        }
      );
    }

    const user_id = user[0].id;

    const [existingSubscription]: any = await db.execute(
      "SELECT id FROM subscriptions WHERE user_id = ?",
      [user_id]
    );

    const durationDays = duration === "annual" ? 365 : 30;
    const subscription = getPlanCodeFromName(plan);
    const purchaseDate = new Date();
    const expiryDate = new Date(purchaseDate);
    expiryDate.setDate(expiryDate.getDate() + durationDays);

    if (existingSubscription.length > 0) {
      await db.execute(
        `UPDATE subscriptions
         SET payment_id = ?, plan_name = ?,
         start_date = NOW(), end_date = DATE_ADD(NOW(), INTERVAL ? DAY), status = 'Active'
         WHERE user_id = ?`,
        [razorpay_payment_id, plan, durationDays, user_id]
      );

      await db.execute(`UPDATE users SET subscription = ? WHERE id = ?`, [
        subscription,
        user_id,
      ]);
    } else {
      await db.execute(
        `INSERT INTO subscriptions (user_id, payment_id, plan_name, start_date, end_date, status)
         VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 'Active')`,
        [user_id, razorpay_payment_id, plan, durationDays]
      );

      await db.execute(`UPDATE users SET subscription = ? WHERE id = ?`, [
        subscription,
        user_id,
      ]);
    }

    try {
      const shouldSendConfirmation = await markEmailEventIfNew({
        eventType: "subscription_confirmation",
        eventKey: `subscription-confirmation:${razorpay_payment_id}`,
        userId: user_id,
        email,
        metaJson: JSON.stringify({
          plan,
          duration,
          paymentId: razorpay_payment_id,
        }),
      });

      if (shouldSendConfirmation) {
        const template = subscriptionConfirmationEmailTemplate({
          planName: plan,
          paymentId: razorpay_payment_id,
          amount: typeof AMT === "number" ? AMT : Number(AMT || 0) || undefined,
          purchaseDate: purchaseDate.toISOString().slice(0, 10),
          expiryDate: expiryDate.toISOString().slice(0, 10),
        });

        void sendSesEmail({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
        }).catch((sendErr) => {
          console.error("subscription confirmation email async error:", sendErr);
        });
      }
    } catch (mailErr) {
      // Keep payment verification successful even if email fails.
      console.error("subscription confirmation email error:", mailErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Subscription Payment Verified and Stored Successfully",
      },
      {
        status: 200,
        headers: corsHeaders(req.headers.get("origin")),
      }
    );
  } catch (err) {
    console.error("Verification Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      {
        status: 500,
        headers: corsHeaders(req.headers.get("origin")),
      }
    );
  }
}
