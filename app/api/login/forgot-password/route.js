import db from "@/lib/db";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { forgotPasswordEmailTemplate } from "@/lib/emailTemplates";
import { sendSesEmail } from "@/lib/sesMailer";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({
        message: "If an account exists for this email, a reset link has been sent.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [user] = await db.execute(
      `SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [normalizedEmail]
    );

    if (user.length === 0) {
      return NextResponse.json({
        message: "If an account exists for this email, a reset link has been sent.",
      });
    }

    const resetToken = jwt.sign(
      { email: normalizedEmail },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    await db.execute(
      `UPDATE users SET password_reset_token = ? WHERE LOWER(email) = ?`,
      [resetToken, normalizedEmail]
    );

    const requestOrigin = new URL(req.url).origin;
    const baseUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      requestOrigin ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      ""
    ).replace(/\/$/, "");
    const link = `${baseUrl}/reset-password/confirm?token=${encodeURIComponent(resetToken)}`;

    const template = forgotPasswordEmailTemplate(link);
    try {
      await sendSesEmail({
        to: email.trim(),
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (mailErr) {
      // Keep neutral API behavior even if SES fails.
      console.error("forgot-password SES send error:", mailErr);
    }

    return NextResponse.json({
      message: "If an account exists for this email, a reset link has been sent.",
    });
  } catch (err) {
    console.error("forgot-password error:", err);
    return NextResponse.json({
      message: "If an account exists for this email, a reset link has been sent.",
    });
  }
}
