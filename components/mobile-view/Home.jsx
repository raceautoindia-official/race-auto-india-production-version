import React from "react";
import Main from "./Main";
import Slider from "./Slider";
import './mobile-view.css'
import Exclusive from "./Exclusive";
import Vehicles from "./Vehicles";
import Business from "./Business";
import Farm from "./Farm";
import View from "./View";
import Caurosel from "./Caurosel";
import HomeMarket from "./Market";
import HomeCategories from "@/components/HomeCategories/HomeCategories";
import ReactPlayer_Server from "./ReactPlayerVideo";
import Link from "next/link";
import Image from "next/image";
import LinkedinPage from "@/components/LinkedinForm/LinkedinPage";
import HomeBanner from "@/components/Homebanner/HomeBanner";
import HomeBanner_4 from "@/components/Homebanner/Homebanner-4/HomeBanner-4";
import HomeBanner_3 from "@/components/Homebanner/Homebanner-3/HomeBanner-3";
import HomeBanner_2 from "@/components/Homebanner/Homebanner-2/HomeBanner-2";
import MobileNavNew from "@/components/MobileNavbarNew/MobileNavNew";
import MagazineAd_2 from "@/components/MagazineHomePage/MagazineAd-2";

const mobileHome = async () => {
  const MainContentRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/latest-news`,
    { cache: "no-store" }
  );

  const MainContent = await MainContentRes.json();

  const ExclusiveRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recommended-news`,
    { cache: "no-store" }
  );

  const exclusivecontent = await ExclusiveRes.json();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category`
  );

  const data = await res.json();

  const showOnHome = data.filter((item) => item.show_at_homepage == 1);


  const sidebartopres = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/sidebar_top`,
    { cache: "no-store" }
  );

  const sidebartopData = await sidebartopres.json();

  const sidebarbottomres = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/sidebar_bottom`,
    { cache: "no-store" }
  );

  const sidebarbottomData = await sidebarbottomres.json();

  const sliderRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/post/slider`,
    { cache: "no-store" }
  );
  const slide = await sliderRes.json();

  const sliderType = slide[0].slider_type;

  return (
    <>
      <MobileNavNew />
      <div className="container-fluid mt-5">
        {sliderType == 1 ? (
          <HomeBanner />
        ) : sliderType == 2 ? (
          <HomeBanner_2 />
        ) : sliderType == 3 ? (
          <HomeBanner_3 />
        ) : sliderType == 4 ? (
          <HomeBanner_4 />
        ) : (
          <HomeBanner />
        )}
      </div>
      <Main contentList={MainContent} />
      <div className="container-fluid">
        <MagazineAd_2 />
      </div>
      <hr className='mt-3' style={{ borderTop: "2px solid #333", margin: "0" }} />
      <HomeMarket />
      <Exclusive value={exclusivecontent} />
      <div className="container-fluid">
        {showOnHome.map((item) => (
          <HomeCategories key={item.id} item={item} />
        ))}
      </div>
      <div
        className="mt-1"
        style={{ position: "relative", aspectRatio: "1/1", width: "100%" }}
      >
        <Link href={sidebartopData[0].link || 'https://raceautoindia.com/'}>
          <Image
            unoptimized
            src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${sidebartopData[0].ad_code_300}`}
            alt="sidebar top"
            fill
          />
        </Link>
      </div>
      <View />
      <ReactPlayer_Server />
      <div
        className="mt-1"
        style={{ position: "relative", aspectRatio: "1/1", width: "100%" }}
      >
        <Link href={sidebarbottomData[0].link || 'https://raceautoindia.com/'}>
          <Image
            unoptimized
            src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${sidebarbottomData[0].ad_code_300}`}
            alt="sidebar bottom"
            fill
          />
        </Link>
      </div>
      {/* <LinkedinPage /> */}
      <Caurosel />
    </>
  );
};

export default mobileHome;
