"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import "./latestNews.css";

export default function LatestNewsDesktop() {
  const [newsItems, setNewsItems] = useState([]);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  // Helper to truncate text
  const truncate = (text: string, maxLength: number) =>
    text && text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/latest-news");
        const data = await res.json();
        setNewsItems(data);
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    };

    fetchNews();

    // Set initial device type
    const checkDevice = () => {
      setIsMobileOrTablet(window.innerWidth < 992);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice); // Optional: listen for resize
    return () => window.removeEventListener("resize", checkDevice); // Cleanup
  }, []);

  return (
    <div className="container-fluid py-4 m-2">
      <div className="row">
        {newsItems.slice(0, 4).map((item: any, idx: number) => (
          <div className="col-md-6 mb-4" key={idx}>
            <div className="border-bottom pb-2">
              <div className="row g-2 align-items-center">
                {/* Text Content: 7 Columns */}
                <div className="col-lg-7">
                  <h6 className="fw-semibold mb-1">
                    {isMobileOrTablet ? truncate(item.title, 40) : item.title}
                  </h6>
                  <p className="mb-0 small">
                    {isMobileOrTablet
                      ? truncate(item.summary, 60)
                      : item.summary}
                  </p>
                </div>

                {/* Image: 5 Columns */}
                <div className="col-lg-5">
                  <Link href={`/post/${item.title_slug}`}>
                    <div
                      className="latest-image"
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16/9",
                      }}
                    >
                      <Image
                        src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`}
                        alt={item.title}
                        fill
                        className="rounded"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
