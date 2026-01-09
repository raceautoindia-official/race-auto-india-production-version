import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Cookies removed successfully" });

  // Clear both cookies
  response.cookies.delete('authToken');
  response.cookies.delete('profilePic');

  return response;
}
