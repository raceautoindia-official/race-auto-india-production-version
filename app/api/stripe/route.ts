import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with Test Secret Key
const stripe = new Stripe(process.env.STRIPE_KEY_SECRET as string);

export async function POST() {
  try {
    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr", // Set currency to INR
            product_data: {
              name: "Test Product",
            },
            unit_amount: 50000, // ₹500 (Stripe uses paise, so 50000 = ₹500)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/cancel`,
    });

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
