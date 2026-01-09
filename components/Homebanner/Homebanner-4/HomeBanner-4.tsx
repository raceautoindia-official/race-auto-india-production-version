import React from "react";
import FeatureCard from "../FeatureCard";
import Slider_4 from "./Slider-4";
import styles from "../HomeBanner.module.css";
import SliderMobile from "../SliderMobile";
import FeatureCard_4 from "./FeatureCard_4";
import MobileFeature from "../MobileFeature";
import Slider from "../Slider";

type Feature = {
  id: number;
  title: string;
  title_slug: string;
  image_big: string;
  image_mid: string;
  created_at: any;
  summary: string;
  featured_order: number;
};

const HomeBanner_4 = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/features`,
    {
      cache: "no-store",
    }
  );
  const data: Feature[] = await res.json();
  const orderedFeatures = data.sort(
    (a, b) => a.featured_order - b.featured_order
  );
  const FeatureCardData1 = orderedFeatures
    .map((item) => <FeatureCard_4 item={item} key={item.id} />)
    .slice(0, 5);

  return (
    <>
      <div className={`${styles.pc_homebanner} row mb-4 mt-4`}>
        <div className="col-lg-8 p-0">
          <Slider_4 />
        </div>
        <div className="col-lg-3">
          <div className="row justify-content-center pt-2">
            {FeatureCardData1}
          </div>
        </div>
      </div>
      <div className={`${styles.mobile_homebanner} row mb-1 mt-4`}>
        <div className="col-12 p-0">
          <div className="row m-0 mb-3 p-0">
            <Slider_4 />

            <MobileFeature featureList={orderedFeatures} />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeBanner_4;
