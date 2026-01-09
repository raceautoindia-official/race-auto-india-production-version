import { NextResponse } from "next/server";
import db from "../../../lib/db";

// No need to parse percentages now
const parseValue = (val) => {
  const num = typeof val === "string" ? parseFloat(val.replace("%", "").trim()) : val;
  return isNaN(num) ? null : num;
};

export async function POST(req) {
  try {
    const body = await req.json();
    const rawData = body.data; // rawData is in transposed format (months as columns)

    if (!Array.isArray(rawData)) {
      return NextResponse.json(
        { error: "Invalid data format: data must be an array" },
        { status: 400 }
      );
    }

    const months = Object.keys(rawData[0]).filter((key) => key !== "category");

    for (const month of months) {
      const row = {
        month,
        two_wheeler: null,
        three_wheeler: null,
        passenger: null,
        cv: null,
        tractor: null,
        total: null,
      };

      for (const record of rawData) {
        const category = record.category?.toLowerCase().replace(/-/g, "_");
        if (category in row) {
          row[category] = parseValue(record[month]);
        }
      }

      await db.execute(
        `INSERT INTO overall_automative_industry_line
         (month, two_wheeler, three_wheeler, passenger, cv, tractor, total)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           two_wheeler = VALUES(two_wheeler),
           three_wheeler = VALUES(three_wheeler),
           passenger = VALUES(passenger),
           cv = VALUES(cv),
           tractor = VALUES(tractor),
           total = VALUES(total)`,
        [
          month,
          row.two_wheeler,
          row.three_wheeler,
          row.passenger,
          row.cv,
          row.tractor,
          row.total,
        ]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DB Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}