import db from "@/lib/db";
import { mailDetails, mailTransporter } from "@/utils/Mailer";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();
    const [user] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);

    if (user.length === 0) {
      return NextResponse.json({ err: "No user with that email address" }, { status: 404 });
    }

    const resetToken = jwt.sign(
      { email: email },
      process.env.JWT_KEY,
      { expiresIn: "1h" } // token expires in 1 hour
    );

    const link = `${process.env.NEXT_PUBLIC_BACKEND_URL}verifytoken/${resetToken}`;

    await new Promise((resolve, reject) => {
      mailTransporter.sendMail(
        {
          ...mailDetails,
          to: email,
          subject: "Reset Password Link",
          text: `Please click this link to reset your password: ${link}`,
        },
        (error, info) => {
          if (error) {
            reject(error);
          } else {
            resolve(info);
          }
        }
      );
    });

    return NextResponse.json({ message: "Reset password link sent to your email." });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ err: "Internal server error" }, { status: 500 });
  }
}
