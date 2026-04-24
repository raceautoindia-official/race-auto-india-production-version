import db from "@/lib/db";

type EmailEventInput = {
  eventType: string;
  eventKey: string;
  userId?: number | null;
  email?: string | null;
  metaJson?: string | null;
};

/**
 * Inserts an email event marker if not already present.
 * Returns true when event was newly recorded; false when duplicate.
 */
export async function markEmailEventIfNew(input: EmailEventInput): Promise<boolean> {
  try {
    await db.execute(
      `INSERT INTO email_notifications (event_type, event_key, user_id, email, meta_json)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.eventType,
        input.eventKey,
        input.userId ?? null,
        input.email ?? null,
        input.metaJson ?? null,
      ]
    );
    return true;
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") return false;

    // If migration isn't applied yet, avoid blocking primary flows.
    if (err?.code === "ER_NO_SUCH_TABLE") {
      console.warn("email_notifications table missing; proceeding without dedupe");
      return true;
    }

    throw err;
  }
}
