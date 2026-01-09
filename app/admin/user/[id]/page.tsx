import React from "react";
import dynamic from "next/dynamic";
const EditUser = dynamic(() => import("./edit"), { ssr: false });

const page = () => {
  return <EditUser />;
};

export default page;
