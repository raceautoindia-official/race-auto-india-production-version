import React from "react";
import dynamic from "next/dynamic";
const EventEdit = dynamic(() => import("./edit"), { ssr: false });

const page = () => {
  return <EventEdit />;
};

export default page;
