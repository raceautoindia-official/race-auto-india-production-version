import React from "react";
import dynamic from "next/dynamic";
const Edit_Market = dynamic(() => import("./edit"), { ssr: false });

const page = () => {
  return <Edit_Market />;
};

export default page;
