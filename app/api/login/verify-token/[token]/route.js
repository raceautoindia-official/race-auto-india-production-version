import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { pathname } = new URL(req.url);
    const token = pathname.split("/").pop();
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    return NextResponse.json("Verification success");
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return NextResponse.json({ err: "Token has expired" }, { status: 400 });
    } else if (err.name === "JsonWebTokenError") {
      return NextResponse.json({ err: "Token has expired" }, { status: 400 });
    } else {
      console.log(err);
      return NextResponse.json(
        { err: "Internal server error" },
        { status: 500 }
      );
    }
  }
}
