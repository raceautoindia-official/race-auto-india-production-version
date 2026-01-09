import React from "react";
import SearchPage from "./SearchPage";
import Sidebar from "@/components/Sidebar/Sidebar";

const page = (context: {
  params: { title: string };
  searchParams: { page: string };
}) => {
  const { params, searchParams } = context;

  return (
    <div className="container">
      <div className="row">
        <div className="col-lg-8 mt-4">
          <SearchPage title={params.title} page={searchParams.page} />
        </div>
        <Sidebar/>
      </div>
    </div>
  );
};

export default page;
