import React from "react";

import "./sidebar.css";
import Image from "next/image";
import LatestNewsSwiper from "./LatestNewsList";
import SidebarAdSwiper from './SidebarAd'
import { FaCrown } from "react-icons/fa";
import ExclusiveNewsSwiper from "./ExclusiveNewsList";
import AdSidebar from "../GoogleAds/AdSidebar";
import Link from "next/link";
import Exclusive from "./ExclusiveV2";
import DeskTopView from './View'

export type LatestNewsType = {
  id: number;
  title: string;
  title_slug: string;
  // image_mid: any;
};

export type RecommendedType = {
  image_small: any;
  created_at(created_at: any): React.ReactNode;
  id: number;
  title: string;
  title_slug: string;
  image_mid: string;
};

const Sidebar = async () => {
  const latestnewsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/latest-news`,
    { cache: "no-store" }
  );
  const LatestNewsData: LatestNewsType[] = await latestnewsResponse.json();

  const recommendedResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/recommended-news`,
    { cache: "no-store" }
  );

  const ExclusiveNewsData: RecommendedType[] = await recommendedResponse.json();

  const sidebarTopres = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/sidebar_top`,
    { cache: "no-store" }
  );

  const sidebarTopData = await sidebarTopres.json();

  const sidebarbottomres = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/sidebar_bottom`,
    { cache: "no-store" }
  );

  const sidebarbottomData = await sidebarbottomres.json();

  const eventSettingsRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/event/settings`,
    { cache: "no-store" }
  );
  const eventSettingsData = await eventSettingsRes.json();

  return (
    <div className="col-lg-4 mb-4 mt-4">
      {/* <AdSidebar /> */}
      <div className="row mt-1">
        <div className="col-12">
          <div>
            <div className="side-scrollbar side-scrollbar-primary">
              <Exclusive value={ExclusiveNewsData} />
              {/* <ExclusiveNewsSwiper ExclusiveNewsData={ExclusiveNewsData} /> */}
            </div>
          </div>
        </div>
        {/* <div
          className="my-4"
          style={{ position: "relative", aspectRatio: "1/1", width: "100%" }}
        >
          <Link href={sidebarTopData[0].link || "https://raceautoindia.com/"}>
            {" "}
            <Image
              unoptimized
              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${sidebarTopData[0].ad_code_300}`}
              alt="sidebar top"
              fill
            />
          </Link>
        </div> */}
        <SidebarAdSwiper/>
        {/* <div className="col-12">
          <h6
            style={{
              backgroundColor: "#0192ef",
              padding: 5,
              color: "white",
              fontWeight: 600,
              fontStyle: "normal",
            }}
          >
            Latest News
          </h6>
          <LatestNewsSwiper latestNewsData={LatestNewsData} />
        </div> */}
        <div className="col-12">
          <DeskTopView />
        </div>
      </div>

      {/* <div
        className="my-4"
        style={{ position: "relative", aspectRatio: "1/1", width: "100%" }}
      >
        <Link href={sidebarbottomData[0].link || "https://raceautoindia.com/"}>
          <Image
            unoptimized
            src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${sidebarbottomData[0].ad_code_300}`}
            alt="sidebar top"
            fill
          />
        </Link>
      </div> */}
      <Link href="/subscription">
              <div
                style={{
                  position: "relative",
                  aspectRatio: "1/1.414",
                  width: "100%",
                }}
              >
                <Image
                  src="/images/Research & strategies-01.jpg"
                  alt="news"
                  fill
                  className="rounded object-fit-cover"
                />
              </div>
            </Link>
    </div>
  );
};

export default Sidebar;
