import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    const ids: any = searchParams.get("ids");
    const catgeoryids = ids.split(",").map(Number);
    const [results] = await db.execute<RowDataPacket[]>(
      `  SELECT market_id, COUNT(*) AS count
  FROM subscriber_list
  GROUP BY market_id
  `
    );

    const result = catgeoryids.map((number:number) => {
        // Find the object in the second array where market_no matches the number
        const found = results.find(obj => obj.market_id === number);
        
        // If found, return the object with the market_no and count, otherwise return count as 0
        return {
          market_id: number,
          count: found ? found.count : 0,
        };
      });
    return NextResponse.json(result);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server err" }, { status: 500 });
  }
}
