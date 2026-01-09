import React from "react";
import MainCategory from "./Market";
import Sidebar from "@/components/Sidebar/Sidebar";
import db from "@/lib/db";

const MarketPage = async (context: {
  params: { category: string };
  searchParams: { page: string };
}) => {
  const categoryName = context.params["category"];
  const page = context.searchParams.page;

  const [titledata]: any = await db.execute(
    `SELECT title FROM post_market WHERE title_slug = ?`,
    [categoryName]
  );

  return (
    <>
      <div className="container mt-3">
        <div className="row my-3">
          <h1 className="" style={{ fontWeight: 700 }}>
            {titledata[0].title.toUpperCase()}
          </h1>
          <div className="col-12 d-flex justify-content-center">
            <div className="row justify-content-center">
              <div className="col-lg-8 mt-4">
                <MainCategory categoryName={categoryName} page={page} />
              </div>
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketPage;
