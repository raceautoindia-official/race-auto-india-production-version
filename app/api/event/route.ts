export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Function to remove ordinal suffixes like "st", "nd", "rd", "th"
function removeOrdinalSuffix(date: string) {
  return date.replace(/(\d+)(st|nd|rd|th)/, '$1');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const region = searchParams.get("region");

  try {
    // Base query
    let query = "SELECT * FROM event";
    const conditions: string[] = [];
    const values: any[] = [];

    // Add conditions if category or region is present
    if (category) {
      conditions.push("category = ?");
      values.push(category);
    }

    if (region) {
      conditions.push("region = ?");
      values.push(region);
    }

    // If we have any conditions, add them to the query
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const [results]: any = await db.execute(query, values);

    // Filter out entries with missing or invalid event_date
    const validEvents = results.filter(
      (e: any) =>
        typeof e.event_date === "string" &&
        e.event_date.includes(" -") &&
        !isNaN(new Date(removeOrdinalSuffix(e.event_date.split(" -")[0])).getTime())
    );

    const sortedResults = validEvents.sort((a: any, b: any) => {
      const startDateA = new Date(removeOrdinalSuffix(a.event_date.split(" -")[0]));
      const startDateB = new Date(removeOrdinalSuffix(b.event_date.split(" -")[0]));
      return startDateA.getTime() - startDateB.getTime();
    });

    return NextResponse.json(sortedResults);
  } catch (err) {
    console.error("Error fetching data from reports:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
