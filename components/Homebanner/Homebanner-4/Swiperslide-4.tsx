"use client";
import React, { useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import "../HomeSwiper.css";

type SliderType = {
  id: number;
  title: string;
  title_slug: string;
  image_mid: string;
  image_default:string;
  slider_order: number;
};

export default function SwiperSlide_4({ slides }: { slides: SliderType[] }) {
  const pagination = {
    clickable: true,
    renderBullet: function (index: any, className: any) {
      return '<span class="' + className + '"></span>';
    },
  };

  return (
    <Swiper
      grabCursor={true}
      centeredSlides={true}
      loop={true}
      autoplay={{ delay: 2000, pauseOnMouseEnter: true }} // Increase delay to reduce initial activity
      speed={600} // Faster slide transition
      slidesPerView={1}
      coverflowEffect={{
        rotate: 0,
        stretch: 0,
        depth: 80,
        modifier: 1.5,
      }}
      modules={[Pagination, Autoplay]}
      style={{ marginTop: 3 }}
      pagination={pagination}
    >
      {slides.map((item) => (
        <SwiperSlide key={item.id}>
          <Link href={`/post/${item.title_slug}`}>
            <ImageWithPlaceholder
              src={process.env.NEXT_PUBLIC_S3_BUCKET_URL + item.image_default}
              alt={item.title}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                height: "35px",
                backgroundColor: "rgba(0, 0, 0, 0.5)", // 50% opacity black background
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff", // White text color
                zIndex: 3, // Place above the image
                textAlign: "center",
                padding: "1rem",
              }}
            >
             <div className="swiper-title-container">
              <h6 className="swiper-title">{item.title}</h6>
            </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function ImageWithPlaceholder({ src, alt }: { src: string; alt: string }) {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ width: "100%", position: "relative", aspectRatio: "16/9" }}>
      {/* {loading && (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 2,
          }}
        >
          <Skeleton
            height={50}
            count={1}
            baseColor="#e0e7ff" // Light blue background
            highlightColor="#c7d2fe" // Slightly darker blue highlight
            className="my-4"
          />
        </div>
      )} */}
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: "cover" }}
        priority
        quality={60}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 40vw"
        placeholder="blur"
        blurDataURL="/images/dummy_600x400_ffffff_cccccc (1).png"
      />
    </div>
  );
}
