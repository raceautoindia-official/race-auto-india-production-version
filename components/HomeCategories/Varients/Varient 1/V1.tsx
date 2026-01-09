"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import "../Varient.css";
import { varientproptype } from "@/types/varient";
import { formatDate } from "@/components/Time";

const Varient1 = ({ item }: varientproptype) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const imageSrc = item.image_mid
    ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`
    : "/default.png";

  // Truncate title and summary
  const truncatedTitle =
    item.title.length > 50 ? item.title.slice(0, 50) + "..." : item.title;
  const truncatedSummary =
    typeof item.summary === "string" && item.summary.length > 60
      ? item.summary.slice(0, 60) + "..."
      : item.summary ?? "";

  return isMobile ? (
    <div className="col-12" key={item.id}>
      <Link className="link-style" href={`/post/${item.title_slug}`}>
        <div className="row mb-1">
          <div className="col-7 p-0 ps-2">
            <h6 className=" fs-6">
              <small>{truncatedTitle}</small>
            </h6>
            <p className="text-muted fs-7 mb-0">
              <small>{truncatedSummary}</small>
            </p>
          </div>
          <div className="col-5">
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/9",
              }}
            >
              <Image
                src={imageSrc}
                alt={item.title || "news image"}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
                className="rounded"
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  ) : (
    // 👉 Tablet/Desktop layout
    <div className="mb-3 col-md-4">
      <div className="card card-no-bg h-100">
        <Link className="link-style" href={`/post/${item.title_slug}`}>
          <div className="image-container">
            <Image
              src={imageSrc}
              className="varient-image"
              alt={item.title}
              fill
              priority
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
            />
          </div>
          <div className="card-body">
            <p className="mt-3 card-heading">{truncatedTitle}</p>
            <p className="card-text small">{formatDate(item.created_at)}</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Varient1;
