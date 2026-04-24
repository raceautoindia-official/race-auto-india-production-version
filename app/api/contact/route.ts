import db from "@/lib/db";
import { INTERNAL_NOTIFICATION_RECIPIENTS } from "@/lib/internalNotificationRecipients";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute(
      "SELECT contact_text, contact_address, contact_email, contact_phone FROM settings WHERE id = 1"
    );

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}

const sesRegion = process.env.AWS_SES_REGION ?? process.env.AWS_S3_REGION;
const sesAccessKeyId = process.env.AWS_SES_ACCESS_KEY_ID ?? process.env.AWS_S3_ACCESS_KEY_ID;
const sesSecretAccessKey =
  process.env.AWS_SES_SECRET_ACCESS_KEY ?? process.env.AWS_S3_SECRET_ACCESS_KEY;
const sesFromEmail = "enquiry@raceautoindia.com";
const sesToEmails = [...INTERNAL_NOTIFICATION_RECIPIENTS];

const sesClient =
  sesRegion && sesAccessKeyId && sesSecretAccessKey
    ? new SESClient({
        region: sesRegion,
        credentials: {
          accessKeyId: sesAccessKeyId,
          secretAccessKey: sesSecretAccessKey,
        },
      })
    : null;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: unknown; email?: unknown; message?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json({ err: "name, email and message are required" }, { status: 400 });
    }

    if (!sesClient) {
      console.error("SES configuration missing");
      return NextResponse.json({ err: "email service configuration missing" }, { status: 500 });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    const htmlBody = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `;

    const textBody = `New Contact Form Submission
Name: ${name}
Email: ${email}
Message:
${message}`;

    await sesClient.send(
      new SendEmailCommand({
        Source: sesFromEmail,
        Destination: {
          ToAddresses: sesToEmails,
        },
        Message: {
          Subject: {
            Data: "New Contact Form Submission - Race Auto India",
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: htmlBody,
              Charset: "UTF-8",
            },
            Text: {
              Data: textBody,
              Charset: "UTF-8",
            },
          },
        },
        ReplyToAddresses: [email],
      })
    );

    await db.execute(
      `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`,
      [name, email, message]
    );
    return NextResponse.json("message added");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server err" }, { status: 500 });
  }
}
