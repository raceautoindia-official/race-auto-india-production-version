import React from "react";
import PostListCard from "./CategoryCard";
import Pagination from "./paginate";
import Image from "next/image";
import Link from "next/link";

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

const MainCategory = async ({
  page,
  categoryName,
}: {
  page: string;
  categoryName: string;
}) => {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_BACKEND_URL
    }api/post/main-category?main=${categoryName}&page=${page || 1}`,
    {
      next: {
        revalidate: 600,
      },
    }
  );
  const data = await res.json();

  const post: CateoryPostType[] = data.results;

  const totalCount: number = data.totalpost;

  const adTopres = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/category_top`
  );
  const adTopData = await adTopres.json();

  const adBottomres = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/category_bottom`
  );
  const adBottomData = await adBottomres.json();

  return (
    <>
      <div
        style={{ position: "relative", aspectRatio: "8.9/1", width: "100%" }}
      >
        <Link href={adTopData[0].link || 'https://raceautoindia.com/'} target="_blank">
          <Image
            src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${adTopData[0].ad_code_728}`}
            alt="index top"
            fill
          />
        </Link>
      </div>
      <div className="row my-3">
        {post.map((item) => (
          <PostListCard key={item.id} item={item} />
        ))}
        <div
          style={{ position: "relative", aspectRatio: "8.9/1", width: "100%" }}
        >
          <Link href={adBottomData[0].link || "https://raceautoindia.com/"} target="_blank">
            <Image
              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${adBottomData[0].ad_code_728}`}
              alt="index top"
              fill
            />
          </Link>
        </div>
        <div className="d-flex justify-content-center my-4">
          <Pagination totalCount={totalCount} />
        </div>
      </div>
    </>
  );
};

export default MainCategory;
