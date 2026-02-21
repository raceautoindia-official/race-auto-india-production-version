import React from "react";

import "./sidebar.css";
import Image from "next/image";
import SidebarAdSwiper from "./SidebarAd";
import Link from "next/link";
import Exclusive from "./ExclusiveV2";
import DeskTopView from "./View";

import SquareAd from "@/components/GoogleAds/SquareAd";

export type LatestNewsType = {
  id: number;
  title: string;
  title_slug: string;
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
  // ✅ Use caching (better performance + SEO)
  const [
    latestnewsResponse,
    recommendedResponse,
    sidebarTopres,
    sidebarbottomres,
    eventSettingsRes,
  ] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/latest-news`, {
      next: { revalidate: 60 },
    }),
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/recommended-news`, {
      next: { revalidate: 60 },
    }),
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/sidebar_top`, {
      next: { revalidate: 600 },
    }),
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/sidebar_bottom`, {
      next: { revalidate: 600 },
    }),
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/event/settings`, {
      next: { revalidate: 3600 },
    }),
  ]);

  const LatestNewsData: LatestNewsType[] = await latestnewsResponse.json();
  const ExclusiveNewsData: RecommendedType[] = await recommendedResponse.json();
  const sidebarTopData = await sidebarTopres.json();
  const sidebarbottomData = await sidebarbottomres.json();
  const eventSettingsData = await eventSettingsRes.json();

  return (
    <div className="col-lg-4 mb-4 mt-4">
      {/* ✅ Square Ad #1 (TOP) */}
       <span
                style={{ borderBottom: "1px solid black" }}
                className="m-0 mb-2 p-0 text-center"
              >
                Advertisement
              </span>
      <SquareAd slot="5055587764" className="my-2" minHeight={250} />

      <div className="row mt-1">
        <div className="col-12">
          <div>
            <div className="side-scrollbar side-scrollbar-primary">
              <Exclusive value={ExclusiveNewsData} />
            </div>
          </div>
        </div>

        <SidebarAdSwiper />

        <div className="col-12">
          <DeskTopView />
        </div>
      </div>
 <span
                style={{ borderBottom: "1px solid black" }}
                className="m-0 mb-2 p-0 text-center"
              >
                Advertisement
              </span>
      {/* ✅ Square Ad #2 (BOTTOM) */}
      <SquareAd slot="5547144998" className="my-3" minHeight={250} />

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
