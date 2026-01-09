import React from "react";
import dynamic from "next/dynamic";
const Edit_NewsletterCategory = dynamic(() => import("./edit"), { ssr: false });

const page = () => {
  return <Edit_NewsletterCategory />;
};

export default page;
