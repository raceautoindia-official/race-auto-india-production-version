import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { welcomeEmailTemplate } from "@/lib/emailTemplates";
import { sendSesEmail } from "@/lib/sesMailer";
import { markEmailEventIfNew } from "@/lib/emailNotificationLog";

// CORS Preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();

    // Check existing email
    const [emailRows] = await db.execute(
      `SELECT 1 FROM users WHERE email = ?`,
      [email]
    );
    if (emailRows.length > 0) {
      return new Response(
        JSON.stringify({ message: "User with this email already exists" }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Check existing username
    const [userRows] = await db.execute(
      `SELECT 1 FROM users WHERE username = ?`,
      [username]
    );
    if (userRows.length > 0) {
      return new Response(
        JSON.stringify({ message: "User with this username already exists" }),
        {
          status: 409,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert new user
    const [insertResult] = await db.execute(
      `INSERT INTO users (username, email, password, role, subscription) VALUES (?, ?, ?, ?, ?)`,
      [username, email, hash, "user", 0]
    );
    const userId = insertResult?.insertId;

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
            console.error("forecast register welcome email async error:", sendErr);
          });
        }
      }
    } catch (mailErr) {
      console.error("forecast register welcome email error:", mailErr);
    }

    return new Response(
      JSON.stringify({ message: "User registered successfully", role: "user" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Register error:", err);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
