import { getPlanUITitle } from "@/lib/subscriptionPlan";

const BRAND_NAME = "Race Auto India";
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://raceautoindia.com").replace(/\/+$/, "");

function wrapEmail(title: string, subtitle: string, body: string) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background:#f3f5f8;font-family:Arial,sans-serif;color:#1f2937;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
              <tr>
                <td style="background:linear-gradient(90deg,#111827,#2563eb);padding:24px;color:#ffffff;">
                  <h1 style="margin:0;font-size:24px;">${BRAND_NAME}</h1>
                  <p style="margin:8px 0 0;font-size:14px;opacity:.92;">${subtitle}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;">
                  ${body}
                </td>
              </tr>
              <tr>
                <td style="padding:16px 24px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
                  <p style="margin:0 0 6px;">Need help? Contact <a href="mailto:enquiry@raceautoindia.com">enquiry@raceautoindia.com</a>.</p>
                  <p style="margin:0;">&copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

export function forgotPasswordEmailTemplate(resetLink: string) {
  const subject = "Reset Your Password - Race Auto India";
  const html = wrapEmail(
    subject,
    "Password Reset Request",
    `
    <h2 style="margin:0 0 12px;font-size:20px;">Reset your password</h2>
    <p style="margin:0 0 14px;line-height:1.6;">We received a request to reset your account password. This link is valid for 1 hour.</p>
    <p style="margin:0 0 20px;">
      <a href="${resetLink}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:700;">Reset Password</a>
    </p>
    <p style="margin:0;line-height:1.6;">If you did not request this, you can ignore this email safely.</p>
    `
  );
  const text = `Reset your password: ${resetLink}\n\nThis link expires in 1 hour.`;
  return { subject, html, text };
}

export function welcomeEmailTemplate(name?: string) {
  const subject = "Welcome to Race Auto India";
  const userName = (name || "Subscriber").trim();
  const html = wrapEmail(
    subject,
    "Welcome to Premium Automotive Intelligence",
    `
    <h2 style="margin:0 0 12px;font-size:20px;">Welcome, ${userName}</h2>
    <p style="margin:0 0 14px;line-height:1.6;">Your account is now active. You can explore market intelligence, insights, and subscription plans from your dashboard.</p>
    <p style="margin:0 0 20px;">
      <a href="${SITE_URL}/profile" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:700;">Go to Profile</a>
    </p>
    <p style="margin:0;line-height:1.6;">We are glad to have you with us.</p>
    `
  );
  const text = `Welcome ${userName}! Visit ${SITE_URL}/profile to get started.`;
  return { subject, html, text };
}

type SubscriptionConfirmationInput = {
  planName: string;
  paymentId?: string;
  amount?: number;
  purchaseDate?: string;
  expiryDate?: string;
};

export function subscriptionConfirmationEmailTemplate(input: SubscriptionConfirmationInput) {
  const planLabel = getPlanUITitle(input.planName || "none");
  const subject = `Subscription Confirmed - ${planLabel}`;
  const html = wrapEmail(
    subject,
    "Your subscription payment is successful",
    `
    <h2 style="margin:0 0 12px;font-size:20px;">Subscription Activated</h2>
    <p style="margin:0 0 14px;line-height:1.6;">Your <strong>${planLabel}</strong> plan is now active.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 16px;">
      <tr><td style="padding:8px 0;color:#6b7280;">Plan</td><td style="padding:8px 0;text-align:right;font-weight:600;">${planLabel}</td></tr>
      ${typeof input.amount === "number" ? `<tr><td style="padding:8px 0;color:#6b7280;">Amount</td><td style="padding:8px 0;text-align:right;font-weight:600;">INR ${input.amount.toLocaleString("en-IN")}</td></tr>` : ""}
      ${input.purchaseDate ? `<tr><td style="padding:8px 0;color:#6b7280;">Purchase Date</td><td style="padding:8px 0;text-align:right;font-weight:600;">${input.purchaseDate}</td></tr>` : ""}
      ${input.expiryDate ? `<tr><td style="padding:8px 0;color:#6b7280;">Expiry Date</td><td style="padding:8px 0;text-align:right;font-weight:600;">${input.expiryDate}</td></tr>` : ""}
      ${input.paymentId ? `<tr><td style="padding:8px 0;color:#6b7280;">Payment Reference</td><td style="padding:8px 0;text-align:right;font-weight:600;">${input.paymentId}</td></tr>` : ""}
    </table>
    <p style="margin:0;">
      <a href="${SITE_URL}/profile/subscription" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:700;">View Subscription</a>
    </p>
    `
  );
  const text = `Your ${planLabel} subscription is active.${input.expiryDate ? ` Expiry: ${input.expiryDate}.` : ""}`;
  return { subject, html, text };
}

export function subscriptionExpiryReminderTemplate(planName: string, expiryDate: string, daysLeft: number) {
  const planLabel = getPlanUITitle(planName || "none");
  const subject = `Subscription Expiry Reminder - ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
  const html = wrapEmail(
    subject,
    "Your subscription is nearing expiry",
    `
    <h2 style="margin:0 0 12px;font-size:20px;">Renewal Reminder</h2>
    <p style="margin:0 0 14px;line-height:1.6;">Your <strong>${planLabel}</strong> plan expires in <strong>${daysLeft} day${daysLeft === 1 ? "" : "s"}</strong>.</p>
    <p style="margin:0 0 16px;line-height:1.6;">Expiry date: <strong>${expiryDate}</strong></p>
    <p style="margin:0;">
      <a href="${SITE_URL}/subscription" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:700;">Renew Subscription</a>
    </p>
    `
  );
  const text = `Reminder: Your ${planLabel} plan expires on ${expiryDate} (${daysLeft} day${daysLeft === 1 ? "" : "s"} left).`;
  return { subject, html, text };
}

export function businessMemberInviteEmailTemplate(input: {
  ownerEmail: string;
  memberEmail: string;
  acceptLink: string;
  planName: string;
  expiresInHours: number;
}) {
  const planLabel = getPlanUITitle(input.planName || "none");
  const subject = `${BRAND_NAME} Shared Plan Invitation`;
  const html = wrapEmail(
    subject,
    "Shared Membership Approval Required",
    `
    <h2 style="margin:0 0 12px;font-size:20px;">You are invited to a shared plan</h2>
    <p style="margin:0 0 12px;line-height:1.6;">
      <strong>${input.ownerEmail}</strong> has invited <strong>${input.memberEmail}</strong> to join a shared <strong>${planLabel}</strong> plan.
    </p>
    <p style="margin:0 0 16px;line-height:1.6;">
      To activate access, please sign in and accept this invitation.
    </p>
    <p style="margin:0 0 16px;">
      <a href="${input.acceptLink}" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:700;">Accept Membership</a>
    </p>
    <p style="margin:0;line-height:1.6;">
      This invitation expires in ${input.expiresInHours} hour${input.expiresInHours === 1 ? "" : "s"}.
    </p>
    `
  );
  const text = `You have been invited by ${input.ownerEmail} to join a shared ${planLabel} plan. Accept here: ${input.acceptLink}`;
  return { subject, html, text };
}
