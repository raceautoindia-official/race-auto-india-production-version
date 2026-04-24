import { NextResponse } from "next/server";
import { subscriptionConfirmationEmailTemplate } from "@/lib/emailTemplates";
import { sendSesEmail } from "@/lib/sesMailer";
import { markEmailEventIfNew } from "@/lib/emailNotificationLog";

export async function PUT(req) {
  const { email, plan, paymentId, amount, purchaseDate, expiryDate, userId } = await req.json();
  if (!email) {
    return NextResponse.json({ err: "email is required" }, { status: 400 });
  }

  try {
    const eventKey = paymentId
      ? `subscription-confirmation:${paymentId}`
      : `subscription-confirmation:legacy:${String(email).toLowerCase()}:${String(plan || "none").toLowerCase()}:${new Date().toISOString().slice(0, 10)}`;

    const shouldSend = await markEmailEventIfNew({
      eventType: "subscription_confirmation",
      eventKey,
      userId: userId ? Number(userId) : null,
      email: String(email).toLowerCase(),
      metaJson: JSON.stringify({ plan, paymentId }),
    });

    if (!shouldSend) {
      return NextResponse.json({ message: "duplicate skipped" });
    }

    const template = subscriptionConfirmationEmailTemplate({
      planName: plan || "none",
      paymentId: paymentId || undefined,
      amount: typeof amount === "number" ? amount : Number(amount || 0) || undefined,
      purchaseDate: purchaseDate || undefined,
      expiryDate: expiryDate || undefined,
    });

    await sendSesEmail({
      to: String(email).trim(),
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    return NextResponse.json("mail sent success");
  } catch (err) {
    console.error(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}
