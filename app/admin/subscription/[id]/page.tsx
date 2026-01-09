import React from "react";
import dynamic from "next/dynamic";
const EditPlan = dynamic(() => import("./edit"), { ssr: false });

const page = () => {
  return <EditPlan />;
};

export default page;
