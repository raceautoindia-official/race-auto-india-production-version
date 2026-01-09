import React from "react";
import { LatestNewsType } from "./Sidebar";
import Link from "next/link";

const LatestNews = ({ item }: { item: LatestNewsType }) => {
  return (
    <div key={item.id} className="p-2 latest__news-container">
      <Link
        className="link-style latest__news-content"
        href={`/post/${item.title_slug}`}
        replace
      >
        <p>{item.title}</p>
      </Link>
    </div>
  );
};

export default LatestNews;
