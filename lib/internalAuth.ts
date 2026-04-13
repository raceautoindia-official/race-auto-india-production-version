import { NextRequest, NextResponse } from "next/server";

/**
 * Guard for internal service-to-service APIs (e.g. Race Auto Analytics).
 * Caller must send header:  x-internal-api-key: <value of INTERNAL_API_KEY env var>
 *
 * Returns a 401 NextResponse if the key is missing or wrong, otherwise null.
 * Usage:
 *   const denied = checkInternalApiKey(req);
 *   if (denied) return denied;
 */
export function checkInternalApiKey(req: NextRequest): NextResponse | null {
  const secret = process.env.INTERNAL_API_KEY;
  if (!secret) {
    // Env var not configured — deny all internal calls in production
    return NextResponse.json(
      { error: "Internal API not configured" },
      { status: 503 }
    );
  }
  const provided = req.headers.get("x-internal-api-key");
  if (!provided || provided !== secret) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  return null; // authorized
}
