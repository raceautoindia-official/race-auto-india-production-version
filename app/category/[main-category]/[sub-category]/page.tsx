import React from "react";
import SubCategory from "./SubCategory";
import Sidebar from "@/components/Sidebar/Sidebar";
import db from "@/lib/db";

const SubCategoryPage = async (context: {
  params: { "sub-category": string };
  searchParams: { page: string };
}) => {
  const categoryName = context.params["sub-category"];
  const page = context.searchParams.page;

  const [titledata]: any = await db.execute(
    `SELECT name FROM categories WHERE name_slug = ?`,
    [categoryName]
  );

  return (
    <>
      <div className="container mt-3">
        <div className="row my-3">
          <h1 className="" style={{ fontWeight: 700 }}>
            {titledata[0].name.toUpperCase()}
          </h1>
          <div className="col-12 d-flex justify-content-center">
            <div className="row justify-content-center">
              <div className="col-lg-8 mt-4">
                <SubCategory categoryName={categoryName} page={page} />
              </div>
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubCategoryPage;
