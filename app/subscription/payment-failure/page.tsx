export const dynamic = "force-dynamic"
import React from "react";
import FailurePage from "./PaymentFailure";
// import FailurePage from "./PaymentFailure";
// import dynamic from "next/dynamic";
// const FailurePage = dynamic(() => import("./PaymentFailure"), { ssr: false });

const page = () => {
  return <FailurePage />;
};

export default page;
