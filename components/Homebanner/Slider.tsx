import React from "react";
import MySwiperComponent from "./Swiperslide";

type SliderType = {
  id: number;
  title: string;
  title_slug: string;
  image_big: string;
  image_mid:string;
  slider_order: number;
};

const Slider = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/slider`,
    { next: { revalidate: 60 } }
  );
  const slides: SliderType[] = await response.json();

  const sortedSlider = slides.sort((a, b) => a.slider_order - b.slider_order);

  return <MySwiperComponent slides={sortedSlider} />;
};

export default Slider;
