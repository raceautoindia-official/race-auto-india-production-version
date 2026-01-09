import React from "react";
import SwiperSilde_2 from "./SwiperSlide-2";

type SliderType = {
  id: number;
  title: string;
  title_slug: string;
  image_big: string;
  image_default:string;
  image_mid:string;
  slider_order: number;
  summary:string;
  created_at:any;
};

const Slider_2 = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/slider`,
    {
      cache: "no-store",
    }
  );
  const slides: SliderType[] = await response.json();

  const sortedSlider = slides.sort((a, b) => a.slider_order - b.slider_order);

  return <SwiperSilde_2 slides={sortedSlider} />;
};

export default Slider_2;
