"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

function MobileFeature({ featureList }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const truncate = (text, maxLength) =>
    text && text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  return (
    <div className="container-fluid border-bottom border-2 mt-3">
      {featureList?.slice(0, 2).map((item, index) => {
        const titleFull = item.title || "Default Title";
        const summaryFull = item.summary || "No summary available.";

        const title = isMobile ? truncate(titleFull, 40) : titleFull;
        const summary = isMobile ? truncate(summaryFull, 60) : summaryFull;

        const imageSrc = item.image_mid
          ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_default}`
          : "/default.png";

        return (
          <Link className="link-style" href={`/post/${item.title_slug}`} key={index}>
            <div className="row mb-2">
              <div className="col-7">
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                  }}
                >
                  <Image
                    src={imageSrc}
                    alt={titleFull}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                    className="rounded"
                    unoptimized={false}
                  />
                </div>
              </div>
              <div className="col-5 px-0 pe-2">
                <h6 className="fs-6 mb-1">
                  <small>{title}</small>
                </h6>
                <p className="text-muted fs-7 mb-0">
                  <small>{summary}</small>
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default MobileFeature;
