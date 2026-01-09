/* eslint-disable react/jsx-key */
"use client";

import { usePathname } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import ExclusiveNews from "./ExclusiveNews";
import { FaCrown } from "react-icons/fa";

const ExclusiveNewsSwiper = ({ ExclusiveNewsData }) => {
  const pathname = usePathname();

  // Check if the path contains "category"
  if (pathname.includes("category")) {
    return null;
  }

  if (pathname.includes("market")) {
    return null;
  }

  if (pathname.includes("tag")) {
    return null;
  }

  return (
    <>
      <div className="d-flex justify-content-center align-items-center mb-3">
        <div
          style={{
            background:
              "linear-gradient(45deg, #FFD700, #E6C200, #B8860B)", // Gold gradient
            padding: "8px 16px",
            borderRadius: "8px",
            display: "inline-block",
            boxShadow: "0px 4px 10px rgba(255, 215, 0, 0.6)", // Gold glow effect
            position: "relative",
            overflow: "hidden",
          }}
        >
          <h6
            style={{
              color: "white",
              fontWeight: 700,
              fontStyle: "normal",
              fontSize: "18px",
              textShadow: "2px 2px 8px rgba(255, 255, 255, 0.8)", // Premium glow
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: 0,
            }}
          >
            Exclusive News
            <span
              className="ms-2"
              style={{
                display: "inline-block",
                animation: "shine 1.5s linear infinite",
              }}
            >
              <FaCrown
                size={22}
                style={{
                  color: "#FFD700",
                  filter: "drop-shadow(0px 0px 6px #FFD700)",
                }}
              />
            </span>
          </h6>
        </div>
      </div>
      <Swiper
        slidesPerView={1}
        spaceBetween={10}
        loop={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        style={{ height: 240 }}
      >
        {ExclusiveNewsData.map((item) => (
          <SwiperSlide key={item.id}>
            <ExclusiveNews item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </>


  );
};

export default ExclusiveNewsSwiper;
