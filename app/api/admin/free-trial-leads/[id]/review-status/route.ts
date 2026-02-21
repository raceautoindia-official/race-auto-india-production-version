import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const ALLOWED_STATUSES = ["pending", "reviewed", "contacted", "rejected"];

function isAdmin(req: NextRequest) {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) return false;
    const secret = process.env.JWT_KEY;
    if (!secret) return false;

    const decoded = jwt.verify(token, secret) as any;
    const role = String(decoded?.role || "").toLowerCase();

    return ["admin", "moderator", "ad team"].includes(role);
  } catch {
    return false;
  }
}

export async function PATCH(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pathname } = new URL(req.url);
    const id = pathname.split("/").slice(-2, -1)[0]; // .../[id]/review-status

    const body = await req.json();
    const review_status = String(body?.review_status || "").trim();

    if (!id || Number.isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.includes(review_status)) {
      return NextResponse.json({ error: "Invalid review status" }, { status: 400 });
    }

    await db.query(
      `UPDATE free_trial_leads SET review_status = ? WHERE id = ?`,
      [review_status, Number(id)]
    );

    return NextResponse.json({ success: true, message: "Status updated" });
  } catch (err) {
    console.error("Error updating review status:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}