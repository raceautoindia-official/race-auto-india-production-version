"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
// Adjust the import path based on your folder structure
import { Autoplay } from "swiper/modules";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { magazineCardType } from "../../Magazine";
import { Form } from "react-bootstrap";
import Link from "next/link";

export const MagazineSlider = () => {
  const [data, setData] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectedCategory, setSelectedCatgeory] = useState(0);

  const handleSelectChange = (event: any) => {
    setSelectedCatgeory(event.target.value);
  };

  const magazineApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine`
      );
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const magazineCategory = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine/category`
      );
      setCategory(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const magazineSorted = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine/sorted/${selectedCategory}`
      );
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    magazineApi();
    magazineCategory();
  }, []);

  useEffect(() => {
    magazineSorted();
  }, [selectedCategory]);

  return (
    <>
      <div style={{ width: 150, marginTop: 0 }} className="mb-2 mt-1">
        <div className="">
          <select
            id="category"
            value={selectedCategory}
            onChange={handleSelectChange}
            className="text-muted"
            style={{ fontSize: "13px", padding: 4, borderRadius: 10 }}
          ><option className="text-muted"
          style={{ fontSize: "13px" }} value={0}>All</option>
            {category.map((item: any) => (
              <option
                key={item.id}
                value={item.id}
                className="text-muted"
                style={{ fontSize: "13px" }}
              >
                {item.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ overflow: "hidden" }}>
        <Swiper
          direction="vertical"
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          slidesPerView={2}
          spaceBetween={20}

          loop={true}
          modules={[Autoplay]}
          style={{
            height: 650,
          }}
        >
          {data.map((item: any) => (
            <SwiperSlide key={item.id}>
              <div
                style={{
                  position: "relative",
                  aspectRatio: "1/1.414",
                  width: "74%",
                }}
              >
                <Link href={`/magazine/${item.title_slug}`}>
                  <Image
                    alt={item.title}
                    fill
                    priority
                    src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_url}`}
                    sizes="(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1200px) 40vw, 25vw"
                  />
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};
