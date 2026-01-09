import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const [results] = await db.execute<RowDataPacket[]>(
      `SELECT * FROM categories`
    );

    const row = results.map((item: any) => {
      const parentValue = results.find((data) => item.parent_id == data.id);

      if (parentValue) {
        return { ...item, parent: parentValue.name };
      } else {
        return { ...item, parent: null };
      }
    });

    const filteredData = row.filter((item) => item.parent !== null);

    return NextResponse.json(filteredData);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}


export async function POST(req:NextRequest){
    try {
        const { name, description, keywords, color, parent_name } = await req.json();
        const name_slug = name.trim().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").toLowerCase().split(" ").join("-");
        const [parent] = await db.execute<RowDataPacket[]>(`SELECT * FROM categories WHERE id = ?`, [
          parent_name,
        ]);
        const parent_id = parent[0].id;
        const query = [name, name_slug, description, keywords, color, parent_id];
        await db.execute(
          `INSERT INTO categories (name, name_slug, description, keywords, color, parent_id) VALUES (?,?,?,?,?,?)`,
          query
        );
        return NextResponse.json("sub_category created");
      } catch (err) {
        console.log(err);
        return NextResponse.json({ err: "internal server error" },{status:500});
      }
}