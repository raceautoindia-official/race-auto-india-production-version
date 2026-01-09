"use client";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AdHomeBanner from "../GoogleAds/AdHomeHeader";
import Link from "next/link";

const HeaderAd = () => {
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGoogle, setIsGoogle] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
  };

  const headerData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/header`
      );
      setData(res.data[0]);
      setIsGoogle(res.data[0].is_responsive == 1 ? true : false);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    headerData();
  }, []);

  // Auto-hide the ad after 10 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 20000); // 10 seconds

      // Clear timeout if the component unmounts or isVisible changes
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <>
      {isLoading ? (
        <div>
          <Skeleton
            height={50}
            count={1}
            baseColor="#e0e7ff" // Light blue background
            highlightColor="#c7d2fe" // Slightly darker blue highlight
            className="my-4"
          />
        </div>
      ) : !isGoogle ? (
        <div
          className={isVisible ? "my-4" : "d-none my-4"}
          style={{
            position: "relative",
            aspectRatio: "8/1",
            width: "100%",
            objectFit: "contain",
          }}
        >
          <Link href={data.link || 'https://raceautoindia.com/'}>
            <Image
              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${data.ad_code_728}`}
              alt="index top"
              fill
            />
          </Link>
          <button
            onClick={handleClose}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(0, 0, 0, 0.6)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <AdHomeBanner />
      )}
    </>
  );
};

export default HeaderAd;
