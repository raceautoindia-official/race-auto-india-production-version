import React from "react";
import dynamic from "next/dynamic";
const Edit_MainCategory = dynamic(() => import("./edit"), { ssr: false });

const page = () => {
  return <Edit_MainCategory />;
};

export default page;
