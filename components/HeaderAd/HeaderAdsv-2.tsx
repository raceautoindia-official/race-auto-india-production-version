"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

const HeaderAdSwiper = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const handleClose = () => setIsVisible(false);

  const fetchAds = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/header-ads`
      );
      setAds(res.data);
    } catch (err) {
      console.error("Header ad load failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // Auto-hide after 20 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (isLoading) {
    return (
      <div className="my-4">
        <Skeleton height={50} baseColor="#e0e7ff" highlightColor="#c7d2fe" />
      </div>
    );
  }

  if (!isVisible || ads.length === 0) return null;

  return (
    <div
      className="position-relative my-4"
      style={{
        position: "relative",
        aspectRatio: "8/1",
        width: "100%",
        objectFit: "contain",
      }}
    >
      <Swiper
        modules={[EffectFade, Autoplay]}
        effect="fade"
        loop
        autoplay={{ delay: 2000 }}
        speed={1000}
        fadeEffect={{ crossFade: true }}
      >
        {ads.map((ad) => {
          const imageUrl = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${ad.image_url}`;
          console.log("Header Ad Image URL:", imageUrl);

          return (
            <SwiperSlide key={ad.id}>
              <Link
                href={ad.link_url || "https://raceautoindia.com/"}
                target="_blank"
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                   aspectRatio: "8/1",
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt="Header Ad"
                    fill
                    priority
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <button
        onClick={handleClose}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "rgba(0, 0, 0, 0.6)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          padding: "4px 10px",
          fontSize: "16px",
          cursor: "pointer",
          zIndex: 10,
        }}
        aria-label="Close ad"
      >
        ✕
      </button>
    </div>
  );
};

export default HeaderAdSwiper;
