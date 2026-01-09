import React from "react";
import TagComponent from "./Tag";
import Sidebar from "@/components/Sidebar/Sidebar";

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}) {
  const categoryName = params.category;
  const title = `${categoryName} Tag - Explore Categories`;
  const description = `Discover trends, news, and updates in the ${categoryName} tag.`;
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}tag/${categoryName}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

const MarketPage = (context: {
  params: { category: string };
  searchParams: { page: string };
}) => {
  const categoryName = context.params["category"];
  const page = context.searchParams.page;

  return (
    <>
      <div className="container mt-3">
        <div className="row my-3">
          <div className="col-12 d-flex justify-content-center">
            <div className="row justify-content-center">
              <div className="col-lg-8 mt-4">
                <TagComponent categoryName={categoryName} page={page} />
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
