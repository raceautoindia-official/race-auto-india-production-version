import React from "react";
import dynamic from "next/dynamic";
const Edit_subCategory = dynamic(() => import("./edit"), { ssr: false });

const page = () => {
  return <Edit_subCategory />;
};

export default page;
