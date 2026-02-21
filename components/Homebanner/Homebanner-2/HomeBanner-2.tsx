import React from "react";
import Slider_2 from "./Slider-2";
import FeatureCard_2 from "./FeaturedCard-2";
import styles from "../HomeBanner.module.css";
import SliderMobile from "../SliderMobile";
import MobileFeature from "../MobileFeature";
import Slider from "../Slider";
import Slider_4 from "../Homebanner-4/Slider-4";

type Feature = {
  id: number;
  title: string;
  title_slug: string;
  image_big: string;
  image_mid: string;
  created_at: any;
  featured_order: number;
};

const HomeBanner_2 = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/features`,
    { next: { revalidate: 60 } }
  );
  const data: Feature[] = await res.json();
  const orderedFeatures = data.sort(
    (a, b) => a.featured_order - b.featured_order
  );
  const FeatureCardData1 = orderedFeatures
    .map((item) => <FeatureCard_2 item={item} key={item.id} />)
    .slice(0, 2);

  return (
    <>
      <div className={`${styles.pc_homebanner} row mb-4 pt-3`}>
        <div className="col-lg-8">
          <div className="row m-0 p-0">
            <div className="col-12">
              <Slider_2 />
            </div>
            {/* {FeatureCardData1} */}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="row ">{FeatureCardData1}</div>
        </div>
      </div>
      <div className={`${styles.mobile_homebanner} row mb-4 pt-3`}>
        <div className="col-12 p-0">
          <div className="row m-0 p-0">
            <div className="col-12 mb-3">
              <Slider_4 />
            </div>
            <MobileFeature featureList={orderedFeatures} />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeBanner_2;
