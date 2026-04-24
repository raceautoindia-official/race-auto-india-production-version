import db from "@/lib/db";
import { checkInternalApiKey } from "@/lib/internalAuth";
import { NextRequest, NextResponse } from "next/server";
import { markEmailEventIfNew } from "@/lib/emailNotificationLog";
import { sendSesEmail } from "@/lib/sesMailer";
import { subscriptionExpiryReminderTemplate } from "@/lib/emailTemplates";

function daysUntil(dateInput: string | Date): number {
  const today = new Date();
  const target = new Date(dateInput);
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const targetUtc = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  return Math.ceil((targetUtc - todayUtc) / (1000 * 60 * 60 * 24));
}

/**
 * GET /api/internal/subscription/send-expiry-reminders
 * Protected by x-internal-api-key.
 * Sends at most one reminder per subscription per day for expiry window D-7..D-1.
 */
export async function GET(req: NextRequest) {
  const denied = checkInternalApiKey(req);
  if (denied) return denied;

  try {
    const [rows]: any = await db.execute(
      `SELECT s.id AS subscription_id, s.user_id, s.plan_name, s.end_date, u.email, u.username
       FROM subscriptions s
       JOIN users u ON u.id = s.user_id
       WHERE LOWER(s.status) = 'active'
         AND s.start_date <= NOW()
         AND DATE(s.end_date) BETWEEN DATE_ADD(CURDATE(), INTERVAL 1 DAY) AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)`
    );

    let processed = 0;
    let sent = 0;
    let skipped = 0;

    for (const row of rows || []) {
      processed += 1;
      const daysLeft = daysUntil(row.end_date);
      if (daysLeft < 1 || daysLeft > 7) {
        skipped += 1;
        continue;
      }

      const eventKey = `expiry-reminder:${row.subscription_id}:${new Date().toISOString().slice(0, 10)}`;
      const shouldSend = await markEmailEventIfNew({
        eventType: "subscription_expiry_reminder",
        eventKey,
        userId: Number(row.user_id),
        email: String(row.email || "").toLowerCase(),
        metaJson: JSON.stringify({
          subscriptionId: row.subscription_id,
          daysLeft,
          endDate: row.end_date,
        }),
      });

      if (!shouldSend) {
        skipped += 1;
        continue;
      }

      try {
        const template = subscriptionExpiryReminderTemplate(
          String(row.plan_name || "none"),
          new Date(row.end_date).toISOString().slice(0, 10),
          daysLeft
        );
        await sendSesEmail({
          to: String(row.email).trim(),
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
        sent += 1;
      } catch (mailErr) {
        console.error("expiry reminder email error:", mailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      processed,
      sent,
      skipped,
    });
  } catch (err) {
    console.error("send-expiry-reminders error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
