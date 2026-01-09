import { mailTransporter } from "@/utils/Mailer";
import { convert } from "html-to-text";
import { NextResponse } from "next/server";

export async function PUT(req) {
  const { email } = await req.json();
 

  const message = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Membership Approved</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
      }
      .header {
        background: linear-gradient(90deg, #28d7a7, #018ee8);
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
      }
      .content {
        padding: 20px;
        color: #333333;
      }
      .content h2 {
        color: #018ee8;
        font-size: 22px;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        margin: 20px 0;
        background-color: #018ee8;
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
      }
      .footer {
        background-color: #f4f4f4;
        color: #777777;
        font-size: 12px;
        text-align: center;
        padding: 10px;
      }
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Race Auto India</h1>
      </div>
      <div class="content">
        <h2>Welcome to RACE AUTO INDIA – Silver Membership Approved!</h2>
        <p>Congratulations! Your Silver Membership with <strong>RACE AUTO INDIA</strong> has been approved.</p>
        <p>You now have exclusive access to our reports, industry news, and other membership benefits.</p>
        <p>Click the link below to start exploring your membership perks:</p>
        <a href="https://raceautoindia.com/profile" class="button">Access Your Membership</a>
        <p>Welcome aboard!</p>
      </div>
      <div class="footer">
        <p>If you have any questions, feel free to contact us at <a href="mailto:enquiry@raceautoindia.com">enquiry@raceautoindia.com</a>.</p>
        <p>&copy; ${new Date().getFullYear()} Race Auto India. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  // Convert HTML to plain text
  const plainTextMessage = convert(message, { wordwrap: 130 });

  const mailOptions = {
    from: "enquiry@raceautoindia.com",
    to: email,
    subject: "Welcome to RACE AUTO INDIA – Silver Membership Approved!",
    html: message,
    text: plainTextMessage,
    headers: {
      "List-Unsubscribe": "<mailto:enquiry@raceautoindia.com>",
    },
  };

  try {
    const result = await mailTransporter.sendMail(mailOptions);
    return NextResponse.json("mail sent success");
  } catch (err) {
    console.error(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}
