import React from "react";
import PostListCard from "./TagCard";
import Pagination from "./paginate";

export type CateoryPostType = {
  id: number;
  title: string;
  title_slug: string;
  summary: string;
  created_at: any;
  image_description: string;
  image_big: string;
  image_mid: string;
};

const TagComponent = async ({
  page,
  categoryName,
}: {
  page: string;
  categoryName: string;
}) => {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_BACKEND_URL
    }api/post/tag?category=${categoryName}&page=${page || 1}`,
    {
      next: {
        revalidate: 600,
      },
    }
  );
  const data = await res.json();

  const post: CateoryPostType[] = data.results;

  const totalCount: number = data.totalpost;

  return (
    <>
      <div className="row">
        {post.map((item) => (
          <PostListCard key={item.id} item={item} />
        ))}
        <Pagination totalCount={totalCount} />
      </div>
    </>
  );
};

export default TagComponent;
