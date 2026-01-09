import dynamic from "next/dynamic";
import React from "react";
const ArticleEdit = dynamic(
  () => import("@/app/admin/components/Post/post-edit/EditPost"),
  { ssr: false }
);

const page = () => {
  return <ArticleEdit />;
};

export default page;
