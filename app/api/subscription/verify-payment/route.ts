// import crypto from "crypto";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const {
//       razorpay_subscription_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     } = await req.json();

//     if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
//       return NextResponse.json(
//         { success: false, message: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     const secret:any = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET;

//     // Correct Signature Order: payment_id + "|" + subscription_id
//     const generated_signature = crypto
//       .createHmac("sha256", secret)
//       .update(`${razorpay_payment_id}|${razorpay_subscription_id}`) // ✅ Correct order
//       .digest("hex");

//     if (generated_signature === razorpay_signature) {
//       return NextResponse.json({
//         success: true,
//         message: "Subscription Payment Verified",
//       });
//     } else {
//       return NextResponse.json(
//         { success: false, message: "Invalid Subscription Signature" },
//         { status: 400 }
//       );
//     }
//   } catch (err) {
//     console.error("Verification Error:", err);
//     return NextResponse.json(
//       { success: false, message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

import db from "@/lib/db";
import crypto from "crypto";
import schedule from "node-schedule";
import { NextRequest, NextResponse } from "next/server";

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
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET as string; // Fixed environment variable usage

    // Generate HMAC signature
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid Subscription Signature" },
        { status: 403 }
      );
    }

    // Find User ID by Email
    const [user]: any = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (!user[0] || user[0].length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 400 }
      );
    }

    const user_id = user[0].id;

    // Check if the user already has an active subscription
    const [existingSubscription]: any = await db.execute(
      "SELECT id FROM subscriptions WHERE user_id = ?",
      [user_id]
    );

    const durationDays = duration === "annual" ? 365 : 30;
    const expireTime = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    


    if (existingSubscription.length > 0) {
      // Update existing subscription
      const [results]: any = await db.execute(
        `UPDATE subscriptions 
         SET payment_id = ?, plan_name = ?,
         start_date = NOW(), end_date = DATE_ADD(NOW(), INTERVAL ? DAY), status = 'Active' 
         WHERE user_id = ?`,
        [razorpay_payment_id, plan, durationDays, user_id]
      );
      const subscription =
        plan == "silver" ? 1 : plan == "gold" ? 2 : plan == "platinum" ? 3 : 0;
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
        console.log(`scheduled`);
      });
    } else {
      // Insert new subscription
      const [results]: any = await db.execute(
        `INSERT INTO subscriptions (user_id, payment_id, plan_name, start_date, end_date, status)
         VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 'Active')`,
        [user_id, razorpay_payment_id, plan, durationDays]
      );
      const subscription =
        plan == "silver" ? 1 : plan == "gold" ? 2 : plan == "platinum" ? 3 : 0;
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
        console.log(`scheduled`);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Subscription Payment Verified and Stored Successfully",
    });
  } catch (err) {
    console.error("Verification Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
