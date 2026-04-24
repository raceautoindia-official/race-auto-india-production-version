import db from "@/lib/db"; // Your MySQL connection (mysql2/promise or Prisma or any ORM)
import { NextResponse } from "next/server"; // Use express `res` if not in Next.js
import { welcomeEmailTemplate } from "@/lib/emailTemplates";
import { sendSesEmail } from "@/lib/sesMailer";
import { markEmailEventIfNew } from "@/lib/emailNotificationLog";

export async function POST(req) {
  try {
    const body = await req.json(); // Parse JSON body
    const { username, slug, email, google_id } = body;

    if (!username || !slug || !email || !google_id) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Check if user exists
    const [existingUsers] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);

    let user;

    if (existingUsers.length === 0) {
      // 2. Insert new user
      const [insertResult] = await db.execute(
        "INSERT INTO users (username, slug, email, google_id, role, subscription) VALUES (?, ?, ?, ?, ?, ?)",
        [username, slug, email, google_id, "user", 0]
      );
      const userId = insertResult?.insertId ?? null;

      try {
        if (userId) {
          const shouldSendWelcome = await markEmailEventIfNew({
            eventType: "welcome_email",
            eventKey: `welcome-user:${userId}`,
            userId,
            email,
          });
          if (shouldSendWelcome) {
            const template = welcomeEmailTemplate(username);
            void sendSesEmail({
              to: email,
              subject: template.subject,
              html: template.html,
              text: template.text,
            }).catch((sendErr) => {
              console.error("forecast google welcome email async error:", sendErr);
            });
          }
        }
      } catch (mailErr) {
        console.error("forecast google welcome email error:", mailErr);
      }

      // 3. Fetch the new user
      const [newUserRows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
      user = newUserRows[0];
    } else {
      user = existingUsers[0];
    }

    // 4. Return user data
    return NextResponse.json(
      {
        status: "success",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forecast login error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
