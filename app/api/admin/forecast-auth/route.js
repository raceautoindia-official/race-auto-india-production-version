import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const [verifyEmail] = await db.execute(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (verifyEmail.length === 0) {
      return Response.json(
        { message: "No user found" },
        {
          status: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    const user = verifyEmail[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Response.json(
        { message: "Invalid credentials" },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    return Response.json(
      { message: "login success" },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    return Response.json(
      { message: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
