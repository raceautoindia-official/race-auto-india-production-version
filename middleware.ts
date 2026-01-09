import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose"; // Import `jwtVerify` from jose
import axios from "axios";

async function verifyToken(token: any) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_KEY) // Use a TextEncoder to convert the secret to a Uint8Array
    );
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

const routePermissions: any = {
  "/admin": "admin_panel",
  "/admin/ai-powered/:path*":"ai_powered",
  "/admin/magazine/:path*": "newsletter",
  "/admin/page": "pages",
  "/admin/subscription/:path*": "subscription",
  "/admin/reports": "pages",
  "/admin/event/:path*": "event",
  "/admin/article/:path*": "manage_all_posts",
  "/admin/market/:path*": "market",
  "/admin/category/:path*": "categories",
  "/admin/user/:path*": "users",
  "/admin/admin-access": "users",
  "/admin/adspace": "ad_spaces",
  "/admin/settings": "settings",
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const decoded = await verifyToken(token);

  if (!decoded) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  const role =
    decoded.role === "admin"
      ? 1
      : decoded.role === "moderator"
      ? 2
      : decoded.role === "ad team"
      ? 3
      : 4;
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/role/auth-user/${role}`
  );

  const permissions = res.data;
  if (permissions.length === 0) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  const userPermissions = permissions[0];
  const requestedPath = req.nextUrl.pathname;

  // Permission check for dynamic routes
  let requiredPermission :any;
  for (const [route, permission] of Object.entries(routePermissions)) {
    if (
      route.endsWith(":path*") &&
      requestedPath.startsWith(route.replace("/:path*", ""))
    ) {
      requiredPermission = permission;
      break;
    } else if (route === requestedPath) {
      requiredPermission = permission;
      break;
    }
  }

  if (requiredPermission && userPermissions[requiredPermission] !== 1) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/magazine/:path*",
    "/admin/ai-powered/:path*",
    "/admin/subscription/:path*",
    "/admin/reports",
    "/admin/event/:path*",
    "/admin/article/:path*",
    "/admin/page",
    "/admin/market/:path*",
    "/admin/category/:path*",
    "/admin/user/:path*",
    "/admin/admin-access",
    "/admin/adspace",
    "/admin/settings",
  ],
};
