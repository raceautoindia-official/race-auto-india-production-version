import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  void req;
  return NextResponse.json(
    { showPopup: false, reason: "free_trial_discontinued" },
    { status: 200 }
  );
}
