import db from "@/lib/db";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const currentDate = new Date();
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const year = String(currentDate.getFullYear());
const folderName = `${year}${month}`;

export async function GET(req) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  try {
    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);

    if (user.length == 0) {
      return NextResponse.json({ err: "user not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  const { pathname } = new URL(req.url);
  const id = pathname.split("/").pop();
  const formData = await req.formData();
  
  const subscription = formData.get('subscription')

  try {
    const [user] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);

    if (user.length == 0) {
      return res.status(404).json("user not found");
    }

    let query =
      "UPDATE users SET subscription = ?";

    let values = [
      subscription
    ];

    query += " WHERE id = ?";
    values.push(id);

    await db.execute(query, values);

    return NextResponse.json("updated");
  } catch (err) {
    console.log(err);
    return NextResponse.json({ err: "internal server error" }, { status: 500 });
  }
}

