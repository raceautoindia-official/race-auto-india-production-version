import React from "react";
import HomeCategories from "./HomeCategories";
import { category } from "@/types/category";
import Image from "next/image";
import ReactPlayer_Server from "../Sidebar/ReactPlayer";
import Link from "next/link";

const MainComponent = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category`
  );

  const data: category[] = await res.json();

  const showOnHome = data.filter((item) => item.show_at_homepage == 1);

  const adTopres = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/index_top`
  );
  const adTopData = await adTopres.json();

  const adBottomres = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/index_bottom`
  );
  const adBottomData = await adBottomres.json();

  return (
    <>
      <div
        className="mt-4"
        style={{ position: "relative", aspectRatio: "8.9/1", width: "100%" }}
      >
        <Link href={adTopData[0].link || 'https://raceautoindia.com/'} target="_blank">
          <Image
  src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${adTopData[0].ad_code_728}`}
  alt="index top"
  fill
  sizes="(max-width: 768px) 100vw, 728px"
  style={{ objectFit: "contain" }}
  quality={60}
  unoptimized={String(adTopData?.[0]?.ad_code_728 || "").toLowerCase().endsWith(".gif")}
/>

        </Link>
      </div>
      {showOnHome.map((item) => (
        <HomeCategories key={item.id} item={item} />
      ))}
      <div className="my-3">
        <ReactPlayer_Server />
      </div>

      <div
        style={{ position: "relative", aspectRatio: "8.9/1", width: "100%" }}
      >
        <Link href={adBottomData[0].link || 'https://raceautoindia.com/'} target="_blank">
          <Image
  src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${adBottomData[0].ad_code_728}`}
  alt="index Bottom"
  fill
  sizes="(max-width: 768px) 100vw, 728px"
  style={{ objectFit: "contain" }}
  quality={60}
  unoptimized={String(adBottomData?.[0]?.ad_code_728 || "").toLowerCase().endsWith(".gif")}
/>

        </Link>
      </div>
    </>
  );
};

export default MainComponent;
