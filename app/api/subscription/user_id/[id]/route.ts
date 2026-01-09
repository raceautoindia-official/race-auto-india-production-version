import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import schedule from "node-schedule";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();

    // Check if the user already has an active subscription
    const [existingSubscription]: any = await db.execute(
      "SELECT * FROM subscriptions WHERE user_id = ?",
      [id]
    );

    if (existingSubscription.length == 0) {
      return NextResponse.json({ err: "not found" }, { status: 404 });
    }

    return NextResponse.json(existingSubscription);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();

    const { plan, duration, isExisting } = await req.json();

    // Check if the user already has an active subscription
    const [existingSubscription]: any = await db.execute(
      "SELECT id FROM subscriptions WHERE user_id = ?",
      [id]
    );

    const durationDays = duration === "annual" ? 365 : 30;
    const expireTime = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    // const durationDays = 0; // override to 0 for DB, so end_date = NOW() + INTERVAL 0 DAY
    // const expireTime = new Date(Date.now() + 1 * 60 * 1000); // 1 minute in milliseconds

    const subscription =
      plan == "silver" ? 1 : plan == "gold" ? 2 : plan == "platinum" ? 3 : 0;

    if (existingSubscription.length > 0) {
      if (!isExisting) {
        // Update only plan_name and status without modifying start_date and end_date
        await db.execute(
          `UPDATE subscriptions 
           SET plan_name = ?, status = 'Active' 
           WHERE user_id = ?`,
          [plan, id]
        );
      } else {
        // Update existing subscription with new start and end date
        await db.execute(
          `UPDATE subscriptions 
           SET plan_name = ?, 
               start_date = NOW(), 
               end_date = DATE_ADD(NOW(), INTERVAL ? DAY), 
               status = 'Active' 
           WHERE user_id = ?`,
          [plan, durationDays, id]
        );

        // Schedule expiry update
        schedule.scheduleJob(expireTime, async function () {
          await db.execute(
            `UPDATE subscriptions SET status = 'expired' WHERE id = ?`,
            [existingSubscription[0].id]
          );
          await db.execute(`UPDATE users SET subscription = 0 WHERE id = ?`, [
            id,
          ]);
          console.log(`scheduled`);
        });
      }
    } else {
      // Insert new subscription
      const [results]: any = await db.execute(
        `INSERT INTO subscriptions (user_id, plan_name, start_date, end_date, status)
         VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 'Active')`,
        [id, plan, durationDays]
      );

      const subId = results.insertId;

      // Schedule expiry update
      schedule.scheduleJob(expireTime, async function () {
        await db.execute(
          `UPDATE subscriptions SET status = 'expired' WHERE id = ?`,
          [subId]
        );
        await db.execute(`UPDATE users SET subscription = 0 WHERE id = ?`, [
          id,
        ]);
        console.log(`scheduled`);
      });
    }

    // Update user subscription value
    await db.execute(`UPDATE users SET subscription = ? WHERE id = ?`, [
      subscription,
      id,
    ]);

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
