"use client";
import React, { useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import "./HomeSwiper.css";

type SliderType = {
  id: number;
  title: string;
  title_slug: string;
  image_big: string;
  slider_order: number;
  image_mid: string;
};

export default function MySwiperComponent({
  slides,
}: {
  slides: SliderType[];
}) {
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
      autoplay={{ delay: 2000, pauseOnMouseEnter: true }}
      speed={600}
      slidesPerView={1}
      modules={[Pagination, Autoplay]}
      style={{ marginTop: 3 }}
      pagination={pagination}
    >
      {slides.map((item) => (
        <SwiperSlide key={item.id}>
          <Link href={`/post/${item.title_slug}`}>
            <ImageWithPlaceholder
              src={process.env.NEXT_PUBLIC_S3_BUCKET_URL + item.image_big}
              alt={item.title}
            />
            <div className="swiper-title-container">
              <h6 className="swiper-title">{item.title}</h6>
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
    <div style={{ width: "100%", position: "relative", aspectRatio: "3/2" }}>
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
