

import { NextResponse } from "next/server";
import db from "../../../lib/db";

// Escape MySQL column names
const escapeColumn = (name) => `\`${name.replace(/[^a-zA-Z0-9_]/g, "_")}\``;

// Convert "11.85%" -> 11.85 (number)
const parsePercentage = (val) => {
  if (typeof val === "string") {
    const cleaned = val.replace("%", "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  if (typeof val === "number") return val;
  return null;
};

// Strict floating point tolerance
const isExactly100 = (sum) => Math.abs(sum - 100) < 0.0001;

const formatMonth = (date) => {
  return date.toLocaleString("en-US", { month: "short" }).replace(".", "") + "_" + String(date.getFullYear()).slice(2);
};


export async function GET() {
  try {
    const today = new Date();

    const currentMonth = formatMonth(today); // e.g. May_25

    // Get previous month
    const prevMonthDate = new Date(today);
    prevMonthDate.setMonth(today.getMonth() - 1);
    const previousMonth = formatMonth(prevMonthDate); // e.g. Apr_25

    // Same month last year
    const lastYearDate = new Date(today);
    lastYearDate.setFullYear(today.getFullYear() - 1);
    const lastYearMonth = formatMonth(lastYearDate); // e.g. May_24

    // MySQL-safe column names
    const currentCol = `\`${currentMonth}\``;
    const prevCol = `\`${previousMonth}\``;
    const lastYearCol = `\`${lastYearMonth}\``;

    const query = `
      SELECT application_segments, 
             ${lastYearCol} AS lastYear, 
             ${prevCol} AS previousMonth, 
             ${currentCol} AS currentMonth 
      FROM truck_app;
    `;

    const [rows] = await db.execute(query);

    const result = rows.map((row) => ({
      name: row.application_segments,
      [lastYearMonth]: parseFloat(row.lastYear),
      [previousMonth]: parseFloat(row.previousMonth),
      [currentMonth]: parseFloat(row.currentMonth),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error fetching OEM share data:", err);
    return NextResponse.json({ message: "internal error" }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const body = await req.json();
    const rawData = body.data;

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return NextResponse.json({ message: "No data provided" }, { status: 400 });
    }

    const monthTotals = {}; // To accumulate totals per month
    const parsedRows = [];

    for (const row of rawData) {
      const application_segments = row["application_segments"]?.trim() || "";
      const status = 0;

      const parsedMonths = {};
      for (const key in row) {
        if (key !== "application_segments") {
          const parsed = parsePercentage(row[key]);
          if (parsed === null) {
            return NextResponse.json({ message: `Invalid percentage '${row[key]}' for '${key}'` }, { status: 400 });
          }

          parsedMonths[key] = parsed;

          // Sum totals per month
          monthTotals[key] = (monthTotals[key] || 0) + parsed;
        }
      }

      parsedRows.push({ application_segments, status, parsedMonths });
    }

    // Check that each month's total is exactly 100%
    for (const [month, total] of Object.entries(monthTotals)) {
      if (!isExactly100(total)) {
        return NextResponse.json({
          message: `Month '${month}' total must be 100%. Got ${total.toFixed(2)}%.`
        }, { status: 400 });
      }
    }


    // Proceed with inserting after validation
    for (const { application_segments, status, parsedMonths } of parsedRows) {
      // Ensure columns exist
      for (const monthKey of Object.keys(parsedMonths)) {
        const safeColumn = monthKey.replace(/[^a-zA-Z0-9_]/g, "_");
        const [cols] = await db.execute(
          `SHOW COLUMNS FROM truck_app LIKE '${safeColumn}'`
        );
        if (cols.length === 0) {
          await db.execute(
            `ALTER TABLE truck_app ADD COLUMN ${escapeColumn(monthKey)} FLOAT DEFAULT 0`
          );
        }
      }

      const monthColumns = Object.keys(parsedMonths).map(escapeColumn);
      const values = Object.values(parsedMonths);
      const updateSet = [
        `status = VALUES(status)`,
        ...monthColumns.map((col) => `${col} = VALUES(${col})`)
      ].join(", ");

      const insertQuery = `
        INSERT INTO truck_app (application_segments, status, ${monthColumns.join(", ")})
        VALUES (?, ?, ${monthColumns.map(() => "?").join(", ")})
        ON DUPLICATE KEY UPDATE ${updateSet}
      `;

      await db.execute(insertQuery, [application_segments, status, ...values]);
    }

    return NextResponse.json({ message: "Data saved successfully" }, { status: 200 });

  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
