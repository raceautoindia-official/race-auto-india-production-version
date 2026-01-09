export const dynamic = "force-dynamic"
import React from "react";
import ArticleListV2 from "../components/Post/ArticleListSA";
// import dynamic from "next/dynamic";

// const ArticleListV2 = dynamic(
//   () => import("../components/Post/ArticleListSA"),
//   { ssr: false }
// );

const page = (context: { searchParams: { page: string } }) => {
  const page = context.searchParams.page;

  return <ArticleListV2 page={page} />;
};

export default page;
