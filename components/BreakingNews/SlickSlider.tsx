"use client";
import React from "react";
import Link from "next/link";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const SlickSlider = ({
  data,
}: {
  data: {
    id: number;
    title: string;
    title_slug: string;
  }[];
}) => {
  return (
    <div className="overflow-hidden">
      <Swiper
        slidesPerView="auto"
        spaceBetween={50}
        loop={true}
        speed={6000}
        autoplay={{
          delay: 1000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        style={{
          width: "100%",
          whiteSpace: "nowrap",
        }}
        className="mySwiper"
      >
        {data.map((item) => (
          <SwiperSlide
            key={item.id}
            style={{
              display: "inline-block", // Ensure slides are inline
              width: "auto", // Adjust slide width dynamically
            }}
          >
            <Link className="link-style" href={`/post/${item.title_slug}`}>
              <p className="p-0 m-0" style={{ whiteSpace: "nowrap", color:'white' }}>
                {item.title}<span className="ms-5">|</span> 
              </p>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SlickSlider;
