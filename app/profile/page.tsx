export const dynamic = "force-dynamic"
import React from "react";
import ProfileDashboard from "./ProfileComponent";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const Page = async () => {
  // Fetch cookies from the server
  const cookieStore = cookies();
  const token = cookieStore.get("authToken");

  // Redirect if no token
  if (!token) {
    redirect("/");
  }

  // Render the ProfileDashboard with the token
  return <ProfileDashboard token={token.value} />;
};

export default Page;
