import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import {
  getAuthUserFromRequest,
  normalizeEmail,
  hasLeadAlreadySubmitted,
  hasActivePaidSubscription,
  hasConsumedTrialInOldSystem,
} from "@/lib/freeTrialLead";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const full_name = String(body?.full_name || "").trim();
    const email = normalizeEmail(body?.email || "");
    const phone = String(body?.phone || "").trim();
    const company_name = String(body?.company_name || "").trim();
    const segment = String(body?.segment || "").trim();
    const message = String(body?.message || "").trim();

    // Required fields
    if (!full_name) {
      return NextResponse.json(
        { success: false, message: "Full name is required." },
        { status: 400 }
      );
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email is required." },
        { status: 400 }
      );
    }
    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required." },
        { status: 400 }
      );
    }
    if (!segment) {
      return NextResponse.json(
        { success: false, message: "Segment is required." },
        { status: 400 }
      );
    }

    const authUser = getAuthUserFromRequest(req);
    const userId = authUser?.id ?? null;

    // ---- Duplicate lead check (by email / user_id)
    const alreadySubmitted = await hasLeadAlreadySubmitted({
      userId,
      email,
    });

    if (alreadySubmitted) {
      return NextResponse.json(
        { success: false, message: "You have already submitted a trial request." },
        { status: 409 }
      );
    }

    // ---- If logged in, block if already subscribed / trial consumed
    if (userId) {
      const activeSub = await hasActivePaidSubscription(userId);
      if (activeSub.exists) {
        return NextResponse.json(
          { success: false, message: "You already have an active subscription." },
          { status: 403 }
        );
      }

      const trialConsumed = await hasConsumedTrialInOldSystem({
        userId,
        email,
      });
      if (trialConsumed) {
        return NextResponse.json(
          { success: false, message: "Free trial already consumed." },
          { status: 403 }
        );
      }
    }

    // ---- Insert lead
    await db.query(
      `
      INSERT INTO free_trial_leads
      (user_id, full_name, email, phone, company_name, segment, message, review_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        userId,
        full_name,
        email,
        phone || null,
        company_name || null,
        segment,
        message || null,
      ]
    );

    return NextResponse.json(
      { success: true, message: "Trial request submitted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Free trial lead submit error:", error);

    // MySQL duplicate unique email
    if (error?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { success: false, message: "You have already submitted a trial request." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}