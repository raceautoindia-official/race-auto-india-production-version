import { NextRequest, NextResponse } from "next/server";
import { getFreeTrialLeadEligibility } from "@/lib/freeTrialLead";

export async function GET(req: NextRequest) {
  try {
    const result = await getFreeTrialLeadEligibility(req);

    return NextResponse.json(
      {
        showPopup: result.showPopup,
        reason: result.reason,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Eligibility API error:", error);
    return NextResponse.json(
      { showPopup: true, reason: "server_fallback_guest" },
      { status: 200 }
    );
  }
}