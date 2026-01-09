import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { customer_email, AMT } = await req.json();

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const subscription = await razorpay.orders.create({
      amount: AMT * 100,
      currency: "INR",
      receipt: `receipt_${Math.random().toString(36).substring(7)}`,
      notes: {
        email: customer_email,
      },
    });

    return NextResponse.json(subscription);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}
