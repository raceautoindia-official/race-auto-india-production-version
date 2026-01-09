// import db from "@/lib/db";
// import { RowDataPacket } from "mysql2";
// import { NextRequest, NextResponse } from "next/server";
// import bcrypt from "bcryptjs";

// export async function POST(req: NextRequest) {
//   try {
//     const { username, email, password } = await req.json();

//     // Check if email already exists
//     const [existingEmail] = await db.execute<RowDataPacket[]>(
//       `SELECT * FROM users WHERE email = ?`,
//       [email]
//     );
//     if (existingEmail.length !== 0) {
//       return NextResponse.json(
//         { message: "User with this email already exists" },
//         { status: 409 }
//       );
//     }

//     // Check if username already exists
//     const [existingUsername] = await db.execute<RowDataPacket[]>(
//       `SELECT * FROM users WHERE username = ?`,
//       [username]
//     );
//     if (existingUsername.length !== 0) {
//       return NextResponse.json(
//         { message: "User with this username already exists" },
//         { status: 408 }
//       );
//     }

//     // Hash the password
//     const hash = await bcrypt.hash(password, 10);

//     // Insert the new user into the database
//     await db.execute(
//       `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
//       [username, email, hash]
//     );

//     return NextResponse.json(
//       { message: "User registered successfully" },
//       { status: 200 }
//     );
    
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// app/api/auth/register/route.ts
// app/api/auth/register/route.js
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();

    // 1. Check for existing email
    const [emailRows] = await db.execute(
      `SELECT 1 FROM users WHERE email = ?`,
      [email]
    );
    if (emailRows.length > 0) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // 2. Check for existing username
    const [userRows] = await db.execute(
      `SELECT 1 FROM users WHERE username = ?`,
      [username]
    );
    if (userRows.length > 0) {
      return NextResponse.json(
        { message: "User with this username already exists" },
        { status: 409 }
      );
    }

    // 3. Hash the password
    const hash = await bcrypt.hash(password, 10);

    // 4. Insert new user
    const [result] = await db.execute(
      `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hash]
    );
    // result.insertId contains the new user’s ID
    const userId = result.insertId;

    // 5. Sign a JWT
    const token = jwt.sign(
      { id: userId, email, role: "user", username },
      process.env.JWT_KEY,
      { expiresIn: "7d" }
    );

    // 6. Set authToken cookie and return success
    const response = NextResponse.json(
      { message: "User registered successfully" },
      { status: 200 }
    );
    response.cookies.set("authToken", token, {
      path: "/",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
