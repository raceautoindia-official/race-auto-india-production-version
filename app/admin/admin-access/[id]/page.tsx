import dynamic from "next/dynamic";
import React from "react";

const RoleForm = dynamic(() => import("./edit"), { ssr: false });
const page = () => {
  return <RoleForm />;
};

export default page;
