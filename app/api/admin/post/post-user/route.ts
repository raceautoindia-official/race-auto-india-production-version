export const dynamic = "force-dynamic";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  let query = `
  SELECT DISTINCT  
         posts.user_id,
         users.username AS username 
  FROM posts 
  INNER JOIN users ON posts.user_id = users.id
  WHERE 1 = 1`;
  try {
    const [filteredRows] = await db.execute(query);
    return NextResponse.json(filteredRows);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Internal error" }, { status: 500 });
  }
}
