export const dynamic = "force-dynamic";
import React from "react";
import AdminPost from "../../components/Post/PostCreate/Create";
import { cookies } from "next/headers";


const page = async() => {
  const cookieStore = await cookies();
  const token:any = cookieStore.get("authToken");
  return <AdminPost token={token.value}/>;
};

export default page;
