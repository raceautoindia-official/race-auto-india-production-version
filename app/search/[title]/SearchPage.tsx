/* eslint-disable react/no-unescaped-entities */

import React from "react";
import PaginateComponent from "./Paginate";
import SearchCard from "./SearchCard";
import SearchBar from "./SearchBar";

export type SearchData = {
  id: number;
  title: string;
  title_slug: string;
  image_mid: string;
  created_at: string;
};

const SearchPage = async ({ title, page }: { title: string; page: string }) => {
  let data: SearchData[] = [];
  let total;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}api/search/${title}?page=${
        page || 1
      }`,
      { cache: "no-store" }
    );

    if (res.status === 404) {
      data = [];
    } else {
      let post = await res.json();
      data = post.results;
      total = post.totalpages;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    data = [];
  }

  if (data.length === 0) {
    return <div>Not found</div>;
  }

  return (
    <div className="row">
      <SearchBar />

      <h3 className="my-3 text-center text-bold">
        {data.length} Search results for "{title}"{" "}
      </h3>
      {data.map((item) => (
        <SearchCard key={item.id} item={item} />
      ))}
      <div className="mt-4 d-flex justify-content-center">
        <PaginateComponent totalCount={total} />
      </div>
    </div>
  );
};

export default SearchPage;
