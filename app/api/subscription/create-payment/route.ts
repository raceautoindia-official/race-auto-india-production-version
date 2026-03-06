import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { customer_email, AMT } = await req.json();

    if (!customer_email || !AMT) {
      return NextResponse.json(
        { success: false, message: "customer_email and AMT are required" },
        {
          status: 400,
          headers: corsHeaders(req.headers.get("origin")),
        }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const subscription = await razorpay.orders.create({
      amount: Number(AMT) * 100,
      currency: "INR",
      receipt: `receipt_${Math.random().toString(36).substring(7)}`,
      notes: {
        email: customer_email,
      },
    });

    return NextResponse.json(subscription, {
      status: 200,
      headers: corsHeaders(req.headers.get("origin")),
    });
  } catch (err) {
    console.error("create-payment error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders(req.headers.get("origin")),
      }
    );
  }
}