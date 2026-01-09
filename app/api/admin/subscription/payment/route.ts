import db from "@/lib/db";
import s3Client from "@/lib/s3Client";
import { mailTransporter } from "@/utils/Mailer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const formData = await req.formData();
  const title = formData.get("title");
  const username = formData.get("username");
  const email = formData.get("email");
  const phone_number = formData.get("phone_number");
  const file = formData.get("file");
  //   const img_default = `uploads/subscription/${filename}`;

  try {
    const uploadToS3 = async (file: any, folder: any) => {
      const fileExtension = path.extname(file.name);
      const newFileName = `${uuidv4()}${fileExtension}`;
      const s3Key = `${folder}/${newFileName}`;
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      const uploadParams = {
        Bucket: bucketName,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: file.type,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));
      return s3Key; // Return the key for further use in the database
    };
    const imageKey = await uploadToS3(file, "uploads/subscription");
    const fullname = title + " " + username;

    const query = [fullname, email, phone_number, imageKey];

    const subject = `Subscription request from ${username}`;
    const body = `
  <p>I have subscribed to Race Auto India. My payment proof is attached below.</p>
  <p><a href="${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${imageKey}">Payment Proof</a></p>
  <p>Contact Details:</p>
  <ul>
    <li><strong>Email:</strong> ${email}</li>
    <li><strong>Name:</strong> ${username}</li>
    <li><strong>Phone Number:</strong> ${phone_number}</li>
  </ul>
`;

    const mailContent: any = {
      from: email,
      to: "raceautoindia@gmail.com",
      subject: subject,
      html: body,
    };

    await db.execute(
      `INSERT INTO subscription_payment (username, email, phone_number, payment_proof) VALUES (?, ?, ?, ?)
        `,
      query
    );
    mailTransporter.sendMail(mailContent, function (err, data) {
      if (err) {
        console.log("Error sending email to", ":", err);
      }
    });
    return NextResponse.json("mail sent success");
  } catch (err) {
    console.log(err);
  }
}

export async function GET() {
  try {
    const [results] = await db.execute(`SELECT * FROM subscription_payment`);

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json(err, { status: 500 });
  }
}
