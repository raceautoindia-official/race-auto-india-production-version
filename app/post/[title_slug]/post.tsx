/* eslint-disable react/no-unescaped-entities */
import React from "react";
import PostSlider from "./Slider";
import Link from "next/link";
import SocialButton from "./SocialButton";
import { formatDate } from "@/components/Time";
import PostContent from "./postContent";
import { cookies } from "next/headers";
import EditButton from "./AdminButtons";
import Image from "next/image";
import AdArticleMiddle from "@/components/GoogleAds/AdArticleMiddle";
import { FaEye } from "react-icons/fa";
import { Button } from "react-bootstrap";
import LeaderboardAd from "@/components/GoogleAds/LeaderboardAd";

export type postsliderType = {
  image_default: string;
};

type TagType = {
  id: number;
  tag: string;
  tag_slug: string;
};

export type postType = {
  id: number;
  title: string;
  summary: string;
  created_at: any;
  images: postsliderType[];
  image_description: string;
  pageviews: number;
  content: string;
  image_big: string;
  image_default: string;
  image_mid: string;
  tag: TagType[];
  keywords: [];
  main_category_color: string;
  sub_category_color: string;
  main_category: string;
  sub_category: string;
  is_recommended: any;
};

async function incrementPageView(pageUrl: string) {
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/post/pageincrement/${pageUrl}`,
      {
        method: "PUT",
        cache: "no-store",
      }
    );
  } catch (error) {
    console.error("Error incrementing page view:", error);
  }
}

function getBoostedPageViews(actualViews: number): number {
  const ranges = [
    { min: 0, max: 100, boostMin: 15000, boostMax: 17000 },
    { min: 101, max: 250, boostMin: 37001, boostMax: 49000 },
    { min: 251, max: 500, boostMin: 49001, boostMax: 52000 },
    { min: 501, max: 750, boostMin: 62001, boostMax: 75000 },
    { min: 751, max: 1000, boostMin: 95001, boostMax: 118000 },
    { min: 1001, max: Infinity, boostMin: 58001, boostMax: 62000 },
  ];

  const match = ranges.find(
    (r) => actualViews >= r.min && actualViews <= r.max
  );
  if (!match) return actualViews;

  // Stable pseudo-random using sin hash
  const seed = actualViews;
  const pseudo = (Math.sin(seed) + 1) / 2;
  const boosted = match.boostMin + pseudo * (match.boostMax - match.boostMin);

  return Math.floor(boosted);
}

const Post = async ({
  title,
  is_recommended,
}: {
  title: string;
  is_recommended: any;
}) => {
  await incrementPageView(title);

  const cookieStore = await cookies();
  const token = cookieStore.get("authToken");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/post/single-post/${title}`
  );
  const data: postType[] = await res.json();

  const post = data[0];

  const adTopres = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/post_top`
  );
  const adTopData = await adTopres.json();

  const adBottomres = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/post_bottom`
  );
  const adBottomData = await adBottomres.json();

  return (
    <>
      <div className="col-lg-8 mt-3">
        {/* <div
          style={{ position: "relative", aspectRatio: "8.9/1", width: "100%" }}
          className="my-2"
        >
          <a href="https://raceinnovations.in/contact/" target="_blank">
            <Image
              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${adTopData[0].ad_code_728}`}
              alt="index top"
              fill
            />
          </a>
        </div> */}
        <span
                style={{ borderBottom: "1px solid black" }}
                className="m-0 mb-2 p-0 text-center"
              >
                Advertisement
              </span>
        

        <div>
          {(token || token !== undefined) && (
            <EditButton token={token.value} id={post.id} />
          )}

          <h1>
            <b>{post.title}</b>
          </h1>
          <div className="my-2">
            <span
              style={{
                backgroundColor: post.main_category_color,
                borderRadius: 30,
                fontSize: "small",
              }}
              className="py-1 px-2 me-1"
            >
              {post.main_category}
            </span>{" "}
            {"|"}
            <span
              style={{
                backgroundColor: post.sub_category_color,
                borderRadius: 30,
                fontSize: "small",
              }}
              className="ms-2 py-1 px-2"
            >
              {post.sub_category}
            </span>
          </div>

          <p className="post-summary">{post.summary}</p>
          <small className="d-block mb-2" style={{ fontStyle: "bold" }}>
            <FaEye /> <b>{472 + post.pageviews}</b> views | Date:{" "}
            {formatDate(post.created_at)}
          </small>
          {/* <small className=""> </small> */}
          <SocialButton title_slug={title} />
          <Link href="https://www.linkedin.com/newsletters/7108421736664109056/">
            <button className=" mt-3 btn btn-primary">
              Subscribe on LinkedIn
            </button>
          </Link>

          <hr />
        </div>
        <PostSlider images={post.images} title={post.title} />

        {/* Mobile Banner (1:1) */}
        <div
          className="position-relative my-2 d-block d-md-none"
          style={{ width: "100%", aspectRatio: "1/1" }}
        >
          <Link href="/subscription" passHref>
            <Image
              src="/images/width 400  height 400 Mobile banner.jpg"
              alt="Subscribe – mobile"
              fill
              style={{ objectFit: "cover" }}
              sizes="100vw"
              quality={75}
            />
          </Link>
        </div>
<LeaderboardAd slot="9918463715" className="my-3" />
        <PostContent
          content={post.content}
          token={token?.value}
          is_recommended={is_recommended}
          postId={post.id}
        />
        {post.tag.map((item) => (
          <Link href={`/tag/${item.tag_slug}`} key={item.id}>
            <span className="badge badge-primary mr-3" style={{ color: "red" }}>
              {item.tag}
            </span>
          </Link>
        ))}
        {/* <div
          className="mt-2"
          style={{ position: "relative", aspectRatio: "8.9/1", width: "100%" }}
        >
          <a href="https://raceinnovations.in/contact/" target="_blank">
            <Image
              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${adBottomData[0].ad_code_728}`}
              alt="index top"
              fill
            />
          </a>
        </div> */}
        <br/>
        <span
                style={{ borderBottom: "1px solid black" }}
                className="m-0 mb-2 p-0 text-center"
              >
                Advertisement
              </span>
        <LeaderboardAd slot="7948526797" className="my-4" />
      </div>
      

    </>
  );
};

export default Post;
