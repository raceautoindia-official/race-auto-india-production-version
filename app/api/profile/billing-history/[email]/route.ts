import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getPlanUITitle } from "@/lib/subscriptionPlan";

type BillingEntry = {
  id: string;
  status: "Success" | "Failed";
  planLabel: string;
  amount: number | null;
  paymentReference: string | null;
  createdAt: string | null;
};

function parseMeta(metaJson: any): Record<string, any> {
  if (!metaJson) return {};
  try {
    const parsed = JSON.parse(String(metaJson));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function GET(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url);
    const email = decodeURIComponent(pathname.split("/").pop() || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const [userRows]: any = await db.execute(
      `SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [email]
    );
    const userId = userRows[0]?.id;
    if (!userId) {
      return NextResponse.json({ history: [] });
    }

    let history: BillingEntry[] = [];

    try {
      const [rows]: any = await db.execute(
        `SELECT id, event_type, event_key, meta_json, created_at
         FROM email_notifications
         WHERE user_id = ?
           AND event_type IN ('subscription_confirmation', 'subscription_payment_failed')
         ORDER BY created_at DESC
         LIMIT 100`,
        [userId]
      );

      history = (rows || []).map((row: any) => {
        const meta = parseMeta(row.meta_json);
        const status: "Success" | "Failed" =
          row.event_type === "subscription_payment_failed" ? "Failed" : "Success";

        return {
          id: String(row.id),
          status,
          planLabel: getPlanUITitle(String(meta.plan || meta.planName || "none")),
          amount: Number.isFinite(Number(meta.amount)) ? Number(meta.amount) : null,
          paymentReference: meta.paymentId ? String(meta.paymentId) : null,
          createdAt: row.created_at ? String(row.created_at) : null,
        };
      });
    } catch (err: any) {
      if (err?.code !== "ER_NO_SUCH_TABLE") throw err;
    }

    if (history.length === 0) {
      const [latestSubRows]: any = await db.execute(
        `SELECT id, plan_name, payment_id, start_date, status
         FROM subscriptions
         WHERE user_id = ? AND payment_id IS NOT NULL AND payment_id <> ''
         ORDER BY start_date DESC, id DESC
         LIMIT 10`,
        [userId]
      );

      history = (latestSubRows || [])
        .filter((row: any) => String(row.status || "").toLowerCase() === "active")
        .map((row: any) => ({
          id: `sub-${row.id}`,
          status: "Success" as const,
          planLabel: getPlanUITitle(String(row.plan_name || "none")),
          amount: null,
          paymentReference: row.payment_id ? String(row.payment_id) : null,
          createdAt: row.start_date ? String(row.start_date) : null,
        }));
    }

    return NextResponse.json({ history });
  } catch (err) {
    console.error("GET /api/profile/billing-history/[email] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
