"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import LatestNews from "./LatestNews"; // Adjust the import path based on your folder structure
import { Autoplay } from "swiper/modules";

interface LatestNewsSwiperProps {
  latestNewsData: Array<{ id: number; [key: string]: any, title:any; title_slug:any }>
}

const LatestNewsSwiper: React.FC<LatestNewsSwiperProps> = ({ latestNewsData }) => {
  return (
    <div style={{ height: "300px", overflow: "hidden" }}>
      <Swiper
        direction="vertical"
        slidesPerView={4}
        spaceBetween={0}
        loop={true}
        autoplay={{
          delay: 1500,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        style={{
          height: 300,
        }}
      >
        {latestNewsData.map((item) => (
          <SwiperSlide key={item.id}>
            <LatestNews item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default LatestNewsSwiper;
