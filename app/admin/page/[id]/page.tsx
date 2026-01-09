import React from "react";
import dynamic from "next/dynamic";
const AdminPageEdit = dynamic(() => import("./edit"));

const page = () => {
  return <AdminPageEdit />;
};

export default page;
