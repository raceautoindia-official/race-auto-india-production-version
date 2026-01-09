"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Pagination, Autoplay } from "swiper/modules";
import { postsliderType } from "./post";
import Image from "next/image";
import { useState } from "react";
import React from "react";

type SliderType = {
  images: postsliderType[];
  title: string;
};

export default function PostSlider({ images, title }: SliderType) {
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      loop={true}
      autoplay={{
        delay: 2000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      pagination={{
        dynamicBullets: true,
        clickable: true,
      }}
      modules={[Pagination, Autoplay]}
    >
      {images.map((item, i) => (
        <SwiperSlide key={i}>
          <ImageWithPlaceholder
            src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_default}`}
            alt={title}
            priority={i === 0} // Only first image gets priority
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function ImageWithPlaceholder({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [loading, setLoading] = useState(true);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "100%",
        aspectRatio: "16 / 9",
      }}
    >
      {loading && (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 2,
          }}
        >
          <span>Loading...</span>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
        placeholder="blur"
        blurDataURL="/images/dummy_600x400_ffffff_cccccc (1).png"
        style={{ objectFit: "cover" }}
        onLoad={() => setLoading(false)}
        priority={priority}
      />
    </div>
  );
}
