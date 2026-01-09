import React from "react";

import styles from "../HomeBanner.module.css";
import FeatureCard from "../FeatureCard";
import Slider_3 from "./Slider-3";
import FeatureCard_3 from "./FeatureCard_3";
import Link from "next/link";
import Image from "next/image";
import SliderMobile from "../SliderMobile";
import MobileFeature from "../MobileFeature";
import Slider from "../Slider";
import Slider_4 from "../Homebanner-4/Slider-4";

type Feature = {
  id: number;
  title: string;
  title_slug: string;
  image_big: string;
  image_default: string;
  image_mid: string;
  created_at: any;
  featured_order: number;
  summary: string;
};

type magazineAd = {
  title: string;
  edition_name: string;
  description: string;
  thumbnail: string;
};

const HomeBanner_3 = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/features`,
    {
      cache: "no-store",
    }
  );

  const recommendedRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/recommended-news`,
    { cache: "no-store" }
  );

  const recommendedData: Feature[] = await recommendedRes.json();

  const data: Feature[] = await res.json();
  const orderedFeatures = data.sort(
    (a, b) => a.featured_order - b.featured_order
  );
  const FeatureCardData1 = orderedFeatures
    .map((item) => <FeatureCard_3 item={item} key={item.id} />)
    .slice(0, 2);

  return (
    <>
      <div className={`${styles.pc_homebanner} row mb-4 pt-3`}>
        <div className="col-lg-4">
          <div className="row py-0">{FeatureCardData1}</div>
        </div>
        <div className="col-lg-8 p-0">
          <div className="row m-0 p-0">
            <div className="col-12">
              <Slider_3 />
            </div>
            {/* {FeatureCardData1} */}
          </div>
        </div>
      </div>
      <div className={`${styles.mobile_homebanner} row mb-4 pt-2`}>
        <div className="col-12 p-0">
          <div className="row m-0 p-0">
            <div className="col-12 mb-3">
             <Slider_4 />
            </div>
            <MobileFeature featureList={orderedFeatures}/>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeBanner_3;
