"use client";

import "../Varient.css";
import SubCardV5_2 from "./Varient5_card2";
import SubCardV5_1 from "./Varient5_card1";
import Link from "next/link";
import Image from "next/image";
import { varient } from "@/types/varient";
import { formatDate } from "@/components/Time";
import { useEffect, useState } from "react";
type VarientProps = {
  item: varient[]; // Array of Variant objects
  single: varient[]; // Array of Variant objects
  three: varient[];
};

const Varient5 = ({ item, single, three }: VarientProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const data1 = item
    .map((item) => <SubCardV5_1 key={item.id} item={item} />)
    .slice(0, 3);
  const data2 = item
    .map((item) => <SubCardV5_2 key={item.id} item={item} />)
    .slice(3, 6);
  return isMobile ? (
    <>
      {three.map((item) => (
        <div className="col-12" key={item.id}>
          <Link className="link-style" href={`/post/${item.title_slug}`}>
            <div className="row mb-1">
              <div className="col-5">
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                  }}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`}
                    alt={item.title || "news image"}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                    className="rounded"
                  />
                </div>
              </div>
              <div className="col-7 p-0 ps-2">
                <h6 className=" fs-6 pb-0">
                  <small>
                    {item.title.length > 50
                      ? item.title.slice(0, 50) + "..."
                      : item.title}
                  </small>
                </h6>
                <p className="text-muted fs-7 mb-0 ">
                  <small>
                    {typeof item.summary === "string" &&
                    item.summary.length > 60
                      ? item.summary.slice(0, 60) + "..."
                      : item.summary ?? ""}
                  </small>
                </p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </>
  ) : (
    <>
      {single.map((item) => (
        <div className="col-12" key={item.id}>
          <div className="card mb-1 mb-3 card-no-bg">
            <Link className="link-style" href={`/post/${item.title_slug}`}>
              <div className="card-body p-0">
                <div className="row">
                  <div className="col-md-8">
                    <div className="image-container">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`}
                        className="varient-image"
                        alt={item.title}
                        fill
                        priority
                        sizes="(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1200px) 40vw, 25vw"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="content mt-4 p-3">
                      <h3 className="card-heading">{item.title}</h3>
                      <p className="card-text small">{item.summary}</p>
                      <p className="card-text small">
                        {formatDate(item.created_at)}
                      </p>
                      {/* <p>{item.titl}</p> */}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      ))}
      <div className="col-sm-12">
        <div className="row">
          <div className="col-sm-6">{data1}</div>
          <div className="col-sm-6">{data2}</div>
        </div>
      </div>
    </>
  );
};

export default Varient5;
