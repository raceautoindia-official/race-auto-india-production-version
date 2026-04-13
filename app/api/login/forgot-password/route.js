import db from "@/lib/db";
import { mailDetails, mailTransporter } from "@/utils/Mailer";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "If an account exists for this email, a reset link has been sent." }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const [user] = await db.execute(
      `SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [normalizedEmail]
    );

    // Always return the same neutral message — do not reveal whether email exists
    if (user.length === 0) {
      return NextResponse.json(
        { message: "If an account exists for this email, a reset link has been sent." }
      );
    }

    const resetToken = jwt.sign(
      { email: normalizedEmail },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    // Store token in DB so it can be invalidated after single use
    await db.execute(
      `UPDATE users SET password_reset_token = ? WHERE LOWER(email) = ?`,
      [resetToken, normalizedEmail]
    );

    // Link points to the dedicated confirm page (not a missing /verifytoken route)
    const baseUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");
    const link = `${baseUrl}/reset-password/confirm?token=${encodeURIComponent(resetToken)}`;

    await new Promise((resolve, reject) => {
      mailTransporter.sendMail(
        {
          ...mailDetails,
          to: email.trim(),
          subject: "Reset Your Password — Race Auto India",
          text: `You requested a password reset.\n\nClick the link below to set a new password. This link expires in 1 hour.\n\n${link}\n\nIf you did not request this, please ignore this email.`,
          html: `
            <p>You requested a password reset for your Race Auto India account.</p>
            <p><a href="${link}" style="background:#111;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;">Reset Password</a></p>
            <p>This link expires in <strong>1 hour</strong>.</p>
            <p>If you did not request this, please ignore this email — your password will not change.</p>
          `,
        },
        (error, info) => {
          if (error) reject(error);
          else resolve(info);
        }
      );
    });

    return NextResponse.json(
      { message: "If an account exists for this email, a reset link has been sent." }
    );
  } catch (err) {
    console.error("forgot-password error:", err);
    // Still return neutral message on error to avoid leaking info
    return NextResponse.json(
      { message: "If an account exists for this email, a reset link has been sent." }
    );
  }
}
