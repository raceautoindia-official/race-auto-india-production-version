"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Card } from "react-bootstrap";
import Link from "next/link";
import Image from "next/image";

export type magazineCardType = {
  id: number;
  image_url: string;
  title: string;
  title_slug: string;
  keywords: string;
  created_date: any;
};

const MagazineAd_2 = () => {
  const [data, setData] = useState<magazineCardType[]>([]);

  const fetchMagazineAd = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine`
      );
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMagazineAd();
  }, []);

  // Optional autoplay force start (for rare cases)
  useEffect(() => {
    const timer = setTimeout(() => {
      const swiperEl = document.querySelector(".mySwiper") as any;
      swiperEl?.swiper?.autoplay?.start();
    }, 500);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <>
      <h2 className="my-2 mt-3" style={{ fontWeight: 700 }}>
        RACE AUTO INDIA Magazine
      </h2>
      <p className="mb-2">
        Stay ahead in the automotive world with top reviews, trends, and expert
        analysis in our latest edition.
      </p>

      {data.length > 5 && (
        <Swiper
          key={data.length}
          slidesPerView={5}
          spaceBetween={20}
          loop={true}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper"
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 30,
            },
          }}
        >
          {data.map((item: magazineCardType) => (
            <SwiperSlide key={item.id}>
              <Card className="mx-3">
                <Link href={`/magazine/`}>
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1/1.414",
                      width: "100%",
                    }}
                  >
                    <Image
                      alt={item.title}
                      fill
                        quality={60}
                      src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_url}`}
                      sizes="(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1200px) 40vw, 25vw"
                    />
                  </div>
                </Link>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </>
  );
};

export default MagazineAd_2;
