import db from "@/lib/db";
import { mailTransporter } from "@/utils/Mailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Get form data from the request
  const formData = await req.formData();
  const paymentMode = formData.get("paymentMode");
  const bankName = formData.get("bankName");
  const amount = formData.get("amount");
  const utrChequeNo = formData.get("utrChequeNo");
  const tdsAmount = formData.get("tdsAmount");
  const email = formData.get("email");
  const phone_number = formData.get("phone_number");

  try {
    // Build an array of values for the query
    const queryValues = [
      paymentMode,
      bankName,
      amount,
      utrChequeNo,
      tdsAmount,
      email,
      phone_number,
    ];

    // Prepare an email notification content
    const subject = `Bank Payment Submission from ${email}`;
    const body = `
      <p>Bank payment details submitted:</p>
      <ul>
        <li><strong>Payment Mode:</strong> ${paymentMode}</li>
        <li><strong>Bank Name:</strong> ${bankName}</li>
        <li><strong>Amount:</strong> ${amount}</li>
        <li><strong>UTR/Cheque/DD No.:</strong> ${utrChequeNo}</li>
        <li><strong>TDS Amount:</strong> ${tdsAmount}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone Number:</strong> ${phone_number}</li>
      </ul>
    `;

    const mailContent: any = {
      from: email,
      to: "raceautoindia@gmail.com",
      subject: subject,
      html: body,
    };

    // Insert into the database; update the table name as needed
    await db.execute(
      `INSERT INTO subscription_bank_payments (payment_mode, bank_name, amount, utr_cheque_no, tds_amount, email, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      queryValues
    );

    // Send notification email (non-blocking)
    mailTransporter.sendMail(mailContent, function (err, data) {
      if (err) {
        console.log("Error sending email:", err);
      }
    });

    return NextResponse.json("Bank payment submission successful");
  } catch (err) {
    console.error(err);
    return NextResponse.error();
  }
}

export async function GET() {
  try {
    const [results] = await db.execute(
      `SELECT * FROM subscription_bank_payments`
    );

    return NextResponse.json(results, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}
