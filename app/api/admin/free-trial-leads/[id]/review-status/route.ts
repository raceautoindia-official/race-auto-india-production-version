import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  void req;
  return NextResponse.json(
    { success: false, message: "Free trial is no longer available." },
    { status: 410 }
  );
}
