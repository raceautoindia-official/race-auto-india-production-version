import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import db from "@/lib/db";

export async function POST(req) {
  try {
    const formData = await req.formData();

    // Retrieve the file from the form data
    const xlsxFile = formData.get("file");
    if (!xlsxFile) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Read the file into a buffer directly
    const fileBuffer = Buffer.from(await xlsxFile.arrayBuffer());

    // Parse the file using XLSX
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // Read the first sheet
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Insert data into the database
    for (const row of sheetData) {
      const {
        market_id = null,
        category_id = null,
        organization = null,
        Location = null,
        name = null,
        designation = null,
        mobile_number = null,
        office_number = null,
        email_id = null,
        website = null,
      } = row;

      await db.execute(
        "INSERT INTO subscriber_list (market_id, category_id, organization, Location, name, designation, mobile_number, office_number, email_id, website) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          market_id,
          category_id,
          organization,
          Location,
          name,
          designation,
          mobile_number,
          office_number,
          email_id,
          website,
        ]
      );
    }

    return NextResponse.json({ message: "File processed successfully" });
  } catch (err) {
    console.error("Error processing file:", err);
    return NextResponse.json(
      { error: "Error processing file" },
      { status: 500 }
    );
  }
}
