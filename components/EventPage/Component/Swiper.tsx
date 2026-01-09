"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./eventpage.css";

const EventSwiper = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/event`
        );
        const events = response.data;
        const eventImages = events
          .map((event: any) => event.image_url)
          .filter((img: string) => !!img);
        setImages(eventImages.slice(0, 4)); // only show 4
      } catch (error) {
        console.error("Error fetching event images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div style={{ marginBottom: "10px" }}>
      {loading ? (
        <div className="d-flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              height={250}
              width="100%"
              style={{ borderRadius: 10 }}
            />
          ))}
        </div>
      ) : (
        images.length > 0 && (
          <Swiper
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 3 },
            }}
            spaceBetween={10}
            loop
            centeredSlides
            pagination={{ clickable: true }}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            modules={[Pagination, Autoplay]}
            className="mySwiper"
          >
            {images.map((src, index) => (
              <SwiperSlide key={index}>
                <div
                  className={`slide-wrapper ${
                    index === activeIndex ? "active-slide" : "grayscale-slide"
                  }`}
                >
                  <div
                    className="image-container"
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "250px",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${src}`}
                      alt={`slide-${index}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )
      )}
    </div>
  );
};

export default EventSwiper;
