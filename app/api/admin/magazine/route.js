

// import db from "@/lib/db";
// import { NextResponse } from "next/server";
// import { v4 as uuidv4 } from "uuid";
// import fs from "fs";
// import path from "path";

// const currentDate = new Date();
// const month = String(currentDate.getMonth() + 1).padStart(2, "0");
// const year = String(currentDate.getFullYear());
// const folderName = `${year}${month}`;

// export async function POST(req) {
//     try {
//       const formData = await req.formData();

//       const title = formData.get("title");
//       const category = formData.get("category");
//       const image_url = formData.get("image_url");
//       const pdf_url = formData.get("pdf_url");
//       const keywords = formData.get("keywords");
//       const slug = formData.get("title_slug")
//       const title_slug = slug.split(" ").join("-");

//       const created_date = new Date();

//       const modifiedBy = "admin";

//       const createdBy = "admin";

//       const modified_date = null;

//       const primaryFolder = folderName;

//       const primaryUploadDir = path.join(
//         process.cwd(),
//         "public/uploads/newsletter",
//         primaryFolder
//       );

//       if (!fs.existsSync(primaryUploadDir)) {
//         fs.mkdirSync(primaryUploadDir, { recursive: true });

//         const htmlContent = `<!DOCTYPE html>
//             <html>
//             <head>
//               <title>403 Forbidden</title>
//             </head>
//             <body>
//               <p>Directory access is forbidden.</p>
//             </body>
//             </html>`;

//         fs.writeFileSync(`${primaryUploadDir}/index.html`, htmlContent);
//       }

//       const imageFilename = image_url.name;
//       const imageFileExtension = path.extname(imageFilename);
//       const newImageName = `${uuidv4()}${imageFileExtension}`;
//       const imagePath = path.join(primaryUploadDir, newImageName);

//       // Save the image file
//       const imageFileBuffer = Buffer.from(await image_url.arrayBuffer());
//       fs.writeFileSync(imagePath, imageFileBuffer);

//       const pdfFilename = pdf_url.name;
//       const pdfFileExtension = path.extname(pdfFilename);
//       const newPdfName = `${uuidv4()}${pdfFileExtension}`;
//       const pdfPath = path.join(primaryUploadDir, newPdfName);

//       // Save the PDF file
//       const pdfFileBuffer = Buffer.from(await pdf_url.arrayBuffer());
//       fs.writeFileSync(pdfPath, pdfFileBuffer);

//       const image = `uploads/newsletter/${folderName}/${newImageName}`;
//       const pdf = `uploads/newsletter/${folderName}/${newPdfName}`;
//       const [results] = await db.execute(
//         "INSERT INTO newsletter (title, title_slug, image_url, created_date, modified_date, category, created_by, keywords, modified_by, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//         [
//           title,
//           title_slug,
//           image,
//           created_date,
//           modified_date,
//           category,
//           createdBy,
//           keywords,
//           modifiedBy,
//           pdf,
//         ]
//       );

//       return NextResponse.json("form submitted");
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       return NextResponse.json(
//         { error: "Internal Server Error" },
//         { status: 500 }
//       );
//     }
//   }

import db from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

const currentDate = new Date();
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const year = String(currentDate.getFullYear());
const folderName = `${year}${month}`;

export async function POST(req) {
  try {
    const formData = await req.formData();

    const title = formData.get("title");
    const category = formData.get("category");
    const image_url = formData.get("image_url");
    const pdf_url = formData.get("pdf_url");
    const keywords = formData.get("keywords");
    const slug = formData.get("title_slug");
    const title_slug = slug.trim().replace(/\s+/g, " ").toLowerCase().split(" ").join("-");

    const created_date = new Date();
    const modifiedBy = "admin";
    const createdBy = "admin";
    const modified_date = null;

    // Generate unique names for image and PDF
    const imageFilename = image_url.name;
    const imageFileExtension = imageFilename.split(".").pop();
    const newImageName = `${uuidv4()}.${imageFileExtension}`;

    const pdfFilename = pdf_url.name;
    const pdfFileExtension = pdfFilename.split(".").pop();
    const newPdfName = `${uuidv4()}.${pdfFileExtension}`;

    // S3 bucket paths
    const imageS3Path = `uploads/newsletter/${folderName}/${newImageName}`;
    const pdfS3Path = `uploads/newsletter/${folderName}/${newPdfName}`;

    // Upload image to S3
    const imageBuffer = Buffer.from(await image_url.arrayBuffer());
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: imageS3Path,
        Body: imageBuffer,
        ContentType: image_url.type,
      })
    );

    // Upload PDF to S3
    const pdfBuffer = Buffer.from(await pdf_url.arrayBuffer());
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: pdfS3Path,
        Body: pdfBuffer,
        ContentType: pdf_url.type,
      })
    );

    const image = imageS3Path;
    const pdf = pdfS3Path;

    // Save the data to the database
    await db.execute(
      "INSERT INTO newsletter (title, title_slug, image_url, created_date, modified_date, category, created_by, keywords, modified_by, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        title_slug,
        image,
        created_date,
        modified_date,
        category,
        createdBy,
        keywords,
        modifiedBy,
        pdf,
      ]
    );

    return NextResponse.json("form submitted");
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
