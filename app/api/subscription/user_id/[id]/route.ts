import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import schedule from "node-schedule";
import { getPlanCodeFromName } from "@/lib/subscriptionPlan";

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();

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

    const [existingSubscription]: any = await db.execute(
      "SELECT id FROM subscriptions WHERE user_id = ?",
      [id]
    );

    const durationDays = duration === "annual" ? 365 : 30;
    const expireTime = new Date(
      Date.now() + durationDays * 24 * 60 * 60 * 1000
    );

    const subscription = getPlanCodeFromName(plan);

    if (existingSubscription.length > 0) {
      if (!isExisting) {
        await db.execute(
          `UPDATE subscriptions 
           SET plan_name = ?, status = 'Active' 
           WHERE user_id = ?`,
          [plan, id]
        );
      } else {
        await db.execute(
          `UPDATE subscriptions 
           SET plan_name = ?, 
               start_date = NOW(), 
               end_date = DATE_ADD(NOW(), INTERVAL ? DAY), 
               status = 'Active' 
           WHERE user_id = ?`,
          [plan, durationDays, id]
        );

        schedule.scheduleJob(expireTime, async function () {
          await db.execute(
            `UPDATE subscriptions SET status = 'expired' WHERE id = ?`,
            [existingSubscription[0].id]
          );
          await db.execute(`UPDATE users SET subscription = 0 WHERE id = ?`, [
            id,
          ]);
        });
      }
    } else {
      const [results]: any = await db.execute(
        `INSERT INTO subscriptions (user_id, plan_name, start_date, end_date, status)
         VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), 'Active')`,
        [id, plan, durationDays]
      );

      const subId = results.insertId;

      schedule.scheduleJob(expireTime, async function () {
        await db.execute(
          `UPDATE subscriptions SET status = 'expired' WHERE id = ?`,
          [subId]
        );
        await db.execute(`UPDATE users SET subscription = 0 WHERE id = ?`, [
          id,
        ]);
      });
    }

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