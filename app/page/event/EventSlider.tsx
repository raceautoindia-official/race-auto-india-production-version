"use client";
import React from "react";
import Image from "next/image";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const EventSlider = () => {
  return (
    <Swiper
      pagination={true}
      autoplay={{
        delay: 2000,
        disableOnInteraction: true,
      }}
      modules={[Autoplay, Pagination]}
      className="mb-4"
    >
      <SwiperSlide>
        <div
          style={{
            aspectRatio: "2.88/1",
            width: "100%",
            position: "relative",
          }}
        >
          <Image
            src="/images/eventslide-1.png"
            alt="magazine banner"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div
          style={{
            aspectRatio: "2.88/1",
            width: "100%",
            position: "relative",
          }}
        >
          <Image
            src="/images/eventslide-4.jpg"
            alt="magazine banner"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div
          style={{
            aspectRatio: "2.88/1",
            width: "100%",
            position: "relative",
          }}
        >
          <Image
            src="/images/eventslide-5.jpg"
            alt="magazine banner"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default EventSlider;
