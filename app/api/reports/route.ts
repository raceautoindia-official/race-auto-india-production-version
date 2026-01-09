export const dynamic = "force-dynamic";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import s3Client from "@/lib/s3Client";

export async function GET() {
  try {
    const [results] = await db.execute(`SELECT * FROM reports WHERE id = 1`);

    return NextResponse.json(results);
  } catch (err) {
    console.log(err);
    return NextResponse.json(err, { status: 500 });
  }
}

// export async function PUT(req: NextRequest) {
//   const formData = await req.formData();
//   const title = formData.get("title");
//   const summary = formData.get("summary");
//   const image_url: any = formData.get("image_url");

//   try {
//     if (!image_url) {
//       await db.execute(
//         `UPDATE reports SET title = ?, summary = ? WHERE id = 1`,
//         [title, summary]
//       );
//       return NextResponse.json("updated");
//     }

//     // Generate a unique filename for the thumbnail
//     const imageFilename = image_url.name;
//     const imageFileExtension = imageFilename.split(".").pop();
//     const newImageName = `${uuidv4()}.${imageFileExtension}`;

//     // Define the S3 path for the thumbnail
//     const folderName = "reports"; // Reports folder in S3 bucket
//     const image_urlS3Path = `uploads/${folderName}/image_url${newImageName}`;

//     // Convert thumbnail file to a buffer
//     const image_urlBuffer = Buffer.from(await image_url.arrayBuffer());

//     // Upload the thumbnail to S3
//     await s3Client.send(
//       new PutObjectCommand({
//         Bucket: process.env.AWS_S3_BUCKET_NAME, // Replace with your S3 bucket name
//         Key: image_urlS3Path,
//         Body: image_urlBuffer,
//         ContentType: image_url.type, // Ensure the correct MIME type is set
//       })
//     );

//     // Save the S3 path to the database
//     const query = [title, summary, image_urlS3Path];
//     await db.execute(
//       `UPDATE reports SET title = ?, summary = ?, image_url = ? WHERE id = 1`,
//       query
//     );

//     return NextResponse.json("updated success");
//   } catch (err) {
//     console.error("Error during PUT request:", err);
//     return NextResponse.json({ err: "internal server error" }, { status: 500 });
//   }
// }

export async function PUT(req: NextRequest) {
  const formData = await req.formData();
  const title = formData.get("title");
  const summary = formData.get("summary");
  const image_url: any = formData.get("image_url");
  const url = formData.get("url");

  try {
    await db.execute(
      `UPDATE reports SET title = ?, summary = ?, image_url = ? WHERE id = 1`,
      [title, summary, url]
    );
    return NextResponse.json("updated");

  } catch (err) {
    console.error("Error during PUT request:", err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}
