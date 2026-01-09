export const dynamic = "force-dynamic"
import React from "react";
import { cookies } from "next/headers";
import AccountSettingsForm from "./settings";

const page = async () => {
  const cookieStore = await cookies();
  const token: any = cookieStore.get("authToken");
  return <AccountSettingsForm token={token.value} />;
};

export default page;
