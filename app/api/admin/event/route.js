import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import db from "@/lib/db";
import s3Client from "@/lib/s3Client";

export async function GET() {
  try {
    // Base query
    const [results] = await db.execute("SELECT * FROM event");

    return NextResponse.json(results);
  } catch (err) {
    console.error("Error fetching data from reports:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Configure your S3 bucket
export async function POST(req) {
  try {
    const currentDate = new Date();
    const year = String(currentDate.getFullYear());
    const folderName = `${year}`;

    // Parse form data
    const formData = await req.formData();
    const image_url = formData.get("image_url"); // File
    const title = formData.get("title");
    const summary = formData.get("summary");
    const location = formData.get("location");
    const referenceLink = formData.get("referenceLink");
    const event_date = formData.get("event_date");
    const category = formData.get("category");
    const region = formData.get("region");

    if (!image_url) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Generate a unique file name
    const imageFilename = image_url.name;
    const imageFileExtension = imageFilename.split(".").pop();
    const newImageName = `${uuidv4()}.${imageFileExtension}`;

    // Upload file to S3
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const s3Key = `uploads/eventpage/${folderName}/${newImageName}`;
    const imageFileBuffer = Buffer.from(await image_url.arrayBuffer());

    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: imageFileBuffer,
      ContentType: image_url.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Construct the public URL of the uploaded file
    const image = s3Key;

    // Insert event data into the database
    await db.execute(
      `INSERT INTO event (title, image_url, summary, location, referenceLink, event_date, category, region)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        image,
        summary,
        location,
        referenceLink,
        event_date,
        category,
        region,
      ]
    );

    return NextResponse.json({ msg: "Upload successful", image });
  } catch (err) {
    console.error("Error during file upload to S3:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// minIO upload

// import { NextResponse } from "next/server";
// import { PutObjectCommand } from "@aws-sdk/client-s3";
// import { v4 as uuidv4 } from "uuid";
// import db from "@/lib/db";
// import s3Client from "@/lib/s3Client";

// export async function POST(req) {
//   try {
//     const currentDate = new Date();
//     const year = String(currentDate.getFullYear());
//     const folderName = `${year}`;

//     const formData = await req.formData();
//     const image_url = formData.get("image_url") ;
//     const title = formData.get("title");
//     const summary = formData.get("summary");
//     const location = formData.get("location");
//     const referenceLink = formData.get("referenceLink");
//     const event_date = formData.get("event_date");

//     if (!image_url) {
//       return NextResponse.json({ error: "No image provided" }, { status: 400 });
//     }

//     const imageFilename = image_url.name;
//     const imageFileExtension = imageFilename.split(".").pop();
//     const newImageName = `${uuidv4()}.${imageFileExtension}`;

//     // MinIO bucket & key
//     const bucketName = process.env.MINIO_BUCKET_NAME || "raceautobucket"; // ✅ MinIO bucket
//     const s3Key = `uploads/eventpage/${folderName}/${newImageName}`;
//     const imageFileBuffer = Buffer.from(await image_url.arrayBuffer());

//     const uploadParams = {
//       Bucket: bucketName,
//       Key: s3Key,
//       Body: imageFileBuffer,
//       ContentType: image_url.type,
//     };

//     await s3Client.send(new PutObjectCommand(uploadParams));

//     // Construct the object path
//     const image = s3Key;

//     await db.execute(
//       "INSERT INTO event (title, image_url, summary, location, referenceLink, event_date) VALUES (?, ?, ?, ?, ?, ?)",
//       [title, image, summary, location, referenceLink, event_date]
//     );

//     return NextResponse.json({ msg: "Upload successful", image });
//   } catch (err) {
//     console.error("Error during file upload to MinIO:", err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
