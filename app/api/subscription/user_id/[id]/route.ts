import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getPlanCodeFromName } from "@/lib/subscriptionPlan";

function toDateOnly(value: any): string | null {
  if (!value) return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

function getDurationDays(durationType: string, customDays: number): number {
  if (durationType === "annual") return 365;
  if (durationType === "custom_days") return Math.max(1, Math.floor(customDays));
  return 30;
}

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();

    const [activeRows]: any = await db.execute(
      `SELECT *
       FROM subscriptions
       WHERE user_id = ? AND LOWER(status) = 'active' AND start_date <= NOW() AND end_date >= NOW()
       ORDER BY end_date DESC
       LIMIT 1`,
      [id]
    );

    if (activeRows.length > 0) {
      return NextResponse.json(activeRows);
    }

    const [latestRows]: any = await db.execute(
      `SELECT *
       FROM subscriptions
       WHERE user_id = ?
       ORDER BY end_date DESC, id DESC
       LIMIT 1`,
      [id]
    );

    if (latestRows.length === 0) {
      return NextResponse.json({ err: "not found" }, { status: 404 });
    }

    return NextResponse.json([{ ...latestRows[0], status: "expired" }]);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const id = pathname.split("/").pop();
    const body = await req.json();

    const planRaw = String(body?.plan || "").toLowerCase().trim();
    const durationType = String(body?.durationType || body?.duration || "monthly")
      .toLowerCase()
      .trim();
    const isExisting = Boolean(body?.isExisting);
    const customDays = Number(body?.customDays || 0);
    const startDate = toDateOnly(body?.startDate) || null;

    const isFreePlan = planRaw === "free" || planRaw === "none" || !planRaw;
    if (isFreePlan) {
      await db.execute(`UPDATE subscriptions SET status = 'expired' WHERE user_id = ?`, [id]);
      await db.execute(`UPDATE users SET subscription = 0 WHERE id = ?`, [id]);
      return NextResponse.json({
        success: true,
        message: "User moved to free plan",
      });
    }

    if (!["monthly", "annual", "custom_days"].includes(durationType)) {
      return NextResponse.json(
        { success: false, message: "Invalid duration type" },
        { status: 400 }
      );
    }

    if (durationType === "custom_days" && (!Number.isFinite(customDays) || customDays < 1)) {
      return NextResponse.json(
        { success: false, message: "Custom days must be at least 1" },
        { status: 400 }
      );
    }

    const durationDays = getDurationDays(durationType, customDays);
    const effectiveStartDate = startDate || new Date().toISOString().slice(0, 10);
    const requiresDateReset = Boolean(startDate) || isExisting || durationType === "custom_days";

    const [existingSubscription]: any = await db.execute(
      "SELECT id FROM subscriptions WHERE user_id = ?",
      [id]
    );

    if (existingSubscription.length > 0) {
      if (requiresDateReset) {
        await db.execute(
          `UPDATE subscriptions
           SET plan_name = ?, start_date = ?, end_date = DATE_ADD(?, INTERVAL ? DAY), status = 'Active'
           WHERE user_id = ?`,
          [planRaw, effectiveStartDate, effectiveStartDate, durationDays, id]
        );
      } else {
        await db.execute(
          `UPDATE subscriptions
           SET plan_name = ?, status = 'Active'
           WHERE user_id = ?`,
          [planRaw, id]
        );
      }
    } else {
      await db.execute(
        `INSERT INTO subscriptions (user_id, plan_name, start_date, end_date, status)
         VALUES (?, ?, ?, DATE_ADD(?, INTERVAL ? DAY), 'Active')`,
        [id, planRaw, effectiveStartDate, effectiveStartDate, durationDays]
      );
    }

    const [activeRows]: any = await db.execute(
      `SELECT id
       FROM subscriptions
       WHERE user_id = ? AND LOWER(status) = 'active' AND start_date <= NOW() AND end_date >= NOW()
       LIMIT 1`,
      [id]
    );

    const nextUserSubscription = activeRows.length > 0 ? getPlanCodeFromName(planRaw) : 0;
    await db.execute(`UPDATE users SET subscription = ? WHERE id = ?`, [nextUserSubscription, id]);

    return NextResponse.json({
      success: true,
      message: "Subscription updated successfully",
    });
  } catch (err) {
    console.error("Verification Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
