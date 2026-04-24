import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

function getOwnerFromRequest(req: NextRequest): { id: number; email: string } | null {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) return null;
    const secret = process.env.JWT_KEY;
    if (!secret) return null;
    const decoded = jwt.verify(token, secret) as any;
    if (!decoded?.id || !decoded?.email) return null;
    return { id: Number(decoded.id), email: String(decoded.email) };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const owner = getOwnerFromRequest(req);
  if (!owner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: "Invite emails are disabled. Ask the member to log in and accept the membership from their profile.",
  });
}
