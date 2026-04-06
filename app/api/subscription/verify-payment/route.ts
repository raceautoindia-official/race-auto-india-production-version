import db from "@/lib/db";
import crypto from "crypto";
import schedule from "node-schedule";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";
import { getPlanCodeFromName } from "@/lib/subscriptionPlan";

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
    const expireTime = new Date(
      Date.now() + durationDays * 24 * 60 * 60 * 1000
    );

    const subscription = getPlanCodeFromName(plan);

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

      schedule.scheduleJob(expireTime, async function () {
        await db.execute(
          `UPDATE subscriptions SET status = 'expired' WHERE id = ?`,
          [existingSubscription[0].id]
        );
        await db.execute(`UPDATE users SET subscription = 0 WHERE id = ?`, [
          user_id,
        ]);
      });
    } else {
      const [results]: any = await db.execute(
        `INSERT INTO subscriptions (user_id, payment_id, plan_name, start_date, end_date, status)
         VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 'Active')`,
        [user_id, razorpay_payment_id, plan, durationDays]
      );

      await db.execute(`UPDATE users SET subscription = ? WHERE id = ?`, [
        subscription,
        user_id,
      ]);

      const subId = results.insertId;

      schedule.scheduleJob(expireTime, async function () {
        await db.execute(
          `UPDATE subscriptions SET status = 'expired' WHERE id = ?`,
          [subId]
        );
        await db.execute(`UPDATE users SET subscription = 0 WHERE id = ?`, [
          user_id,
        ]);
      });
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