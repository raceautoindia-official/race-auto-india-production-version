"use client";
import React from "react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import "../HomeSwiper.css"; // Make sure the CSS below is here

type SliderType = {
  id: number;
  title: string;
  title_slug: string;
  image_big: string;
  image_default: string;
  summary: string;
  image_mid: string;
  slider_order: number;
};

export default function SwiperSlide_2({ slides }: { slides: SliderType[] }) {
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
      style={{ marginTop: 0 }}
      pagination={pagination}
    >
      {slides.map((item) => (
        <SwiperSlide key={item.id}>
          <Link href={`/post/${item.title_slug}`}>
            <div className="slide-container">
              <ImageWithPlaceholder
                src={process.env.NEXT_PUBLIC_S3_BUCKET_URL + item.image_default}
                alt={item.title}
              />

              <div className="overlay-title-banner">
                <h6 className="overlay-title-text">{item.title}</h6>
              </div>

              <div className="overlay-content">
                <h3 className="slide-title">{item.title}</h3>
                <p className="slide-summary">{item.summary}</p>
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

function ImageWithPlaceholder({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="image-wrapper">
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
